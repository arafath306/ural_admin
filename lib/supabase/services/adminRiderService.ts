import { supabase } from '../client';
import {
  IRiderResponse,
  IRidersPaginatedDataResponse,
  ISingleRiderResponse,
} from '@/lib/utils/interfaces/rider.interface';

export interface AdminRiderItem {
  _id: string;
  id: string;
  name: string;
  phone: string;
  is_online: boolean;
  wallet_balance: number;
  rating: number;
  total_deliveries: number;
}

export interface IRiderInput {
  _id?: string;
  name: string;
  username: string;
  password?: string;
  phone?: string;
  zone?: string;
  vehicleType?: string;
  available?: boolean;
}

export interface IZoneItem {
  _id: string;
  title: string;
}

export const DEFAULT_ZONES: IZoneItem[] = [];

function mapRowToRider(r: any, zoneMap?: Map<string, string>): IRiderResponse {
  const zoneTitle =
    typeof r.zone === 'string' && r.zone
      ? r.zone
      : r.zone?.title ||
        (zoneMap && zoneMap.get(r.zone_id)) ||
        'Unknown Zone';

  const zoneId = r.zone_id || '00000000-0000-0000-0000-000000000000';

  let vType = 'motorcycle';
  if (r.vehicle_details) {
    if (typeof r.vehicle_details === 'string') {
      try {
        const parsed = JSON.parse(r.vehicle_details);
        vType = parsed.type || parsed.vehicleType || vType;
      } catch {
        vType = r.vehicle_details;
      }
    } else if (typeof r.vehicle_details === 'object') {
      vType = r.vehicle_details.type || r.vehicle_details.vehicleType || vType;
    }
  }

  return {
    __typename: 'Rider',
    _id: r.id,
    name: r.name || '',
    username: r.username || '',
    phone: r.phone || '',
    available: Boolean(r.available),
    vehicleType: vType,
    assigned: [],
    zone: {
      __typename: 'Zone',
      _id: zoneId,
      title: zoneTitle,
    },
  };
}

function mapRowToSingleRider(r: any, zoneMap?: Map<string, string>): ISingleRiderResponse {
  const base = mapRowToRider(r, zoneMap);

  let vehicleDetails = {
    number: 'DHAKA-METRO-HA-1234',
    image: '',
  };
  if (r.vehicle_details) {
    if (typeof r.vehicle_details === 'string') {
      try {
        const parsed = JSON.parse(r.vehicle_details);
        vehicleDetails = {
          number: parsed.plate || parsed.number || vehicleDetails.number,
          image: parsed.image || '',
        };
      } catch {
        vehicleDetails.number = r.vehicle_details;
      }
    } else if (typeof r.vehicle_details === 'object') {
      vehicleDetails = {
        number: r.vehicle_details.plate || r.vehicle_details.number || vehicleDetails.number,
        image: r.vehicle_details.image || '',
      };
    }
  }

  let licenseDetails = {
    number: 'BD-LIC-' + (r.id ? r.id.substring(0, 6).toUpperCase() : '1234'),
    expiryDate: '2030-12-31T00:00:00Z',
    image: '',
  };
  if (r.license_details) {
    if (typeof r.license_details === 'string') {
      try {
        const parsed = JSON.parse(r.license_details);
        licenseDetails = {
          number: parsed.number || licenseDetails.number,
          expiryDate: parsed.expiryDate || licenseDetails.expiryDate,
          image: parsed.image || '',
        };
      } catch {}
    } else if (typeof r.license_details === 'object') {
      licenseDetails = {
        number: r.license_details.number || licenseDetails.number,
        expiryDate: r.license_details.expiryDate || licenseDetails.expiryDate,
        image: r.license_details.image || '',
      };
    }
  }

  return {
    ...base,
    email: r.email || (r.username ? `${r.username}@ural.com` : 'rider@ural.com'),
    bussinessDetails: {
      bankName: r.account_number ? 'Dutch-Bangla Bank' : 'N/A',
      accountName: r.name || '',
      accountCode: r.account_number || 'N/A',
      accountNumber: 0,
      businessRegNo: 0,
      companyRegNo: 0,
      taxRate: 0,
    },
    licenseDetails,
    vehicleDetails,
  };
}

export const adminRiderService = {
  async fetchRiders(): Promise<AdminRiderItem[]> {
    try {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching riders:', error);
        return [];
      }

      const { data: zones } = await supabase.from('zones').select('id, title');
      const zoneMap = new Map<string, string>();
      if (zones) {
        zones.forEach(z => zoneMap.set(z.id, z.title));
      }

      return (data || []).map((r) => ({
        _id: r.id,
        id: r.id,
        name: r.name,
        phone: r.phone || '',
        is_online: Boolean(r.is_online),
        wallet_balance: Number(r.wallet_balance || 0),
        rating: Number(r.rating || 5.0),
        total_deliveries: Number(r.total_deliveries || 0),
        zoneTitle: zoneMap.get(r.zone_id) || r.zone || 'Unknown Zone',
      }));
    } catch (err) {
      console.error('Failed to fetch riders:', err);
      return [];
    }
  },

  async fetchRidersPaginated({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<IRidersPaginatedDataResponse['ridersPaginated']> {
    try {
      let query = supabase.from('riders').select('*', { count: 'exact' });

      if (search && search.trim()) {
        const term = search.trim();
        query = query.or(`name.ilike.%${term}%,username.ilike.%${term}%,phone.ilike.%${term}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching paginated riders:', error);
        return {
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 1,
        };
      }

      const { data: zones } = await supabase.from('zones').select('id, title');
      const zoneMap = new Map<string, string>();
      if (zones) {
        zones.forEach(z => zoneMap.set(z.id, z.title));
      }

      const mapped = (data || []).map(r => mapRowToRider(r, zoneMap));
      const totalCount = count ?? mapped.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      return {
        data: mapped,
        totalCount,
        currentPage: page,
        totalPages,
      };
    } catch (err) {
      console.error('Failed to fetch paginated riders:', err);
      return {
        data: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
      };
    }
  },

  async fetchRiderById(id: string): Promise<ISingleRiderResponse | null> {
    try {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching rider by id:', error);
        return null;
      }
      
      const { data: zones } = await supabase.from('zones').select('id, title');
      const zoneMap = new Map<string, string>();
      if (zones) {
        zones.forEach(z => zoneMap.set(z.id, z.title));
      }
      return mapRowToSingleRider(data, zoneMap);
    } catch (err) {
      console.error('Failed to fetch rider by id:', err);
      return null;
    }
  },

  async createRider(input: IRiderInput): Promise<IRiderResponse> {
    const { data: zoneData } = await supabase.from('zones').select('title').eq('id', input.zone).maybeSingle();
    const zoneName = zoneData?.title || input.zone || 'Unknown Zone';

    const insertPayload: any = {
      name: input.name,
      username: input.username,
      phone: input.phone || '',
      available: input.available ?? true,
      is_online: input.available ?? true,
      is_active: true,
      zone: zoneName,
      vehicle_details: {
        type: input.vehicleType || 'motorcycle',
        plate: 'DHAKA-METRO-HA-1234',
      },
      rating: 5.0,
      total_deliveries: 0,
      wallet_balance: 0,
      current_wallet: 0,
    };

    if (input.password) {
      insertPayload.password = input.password;
    }

    if (input.zone && input.zone.length === 36 && input.zone.includes('-')) {
      insertPayload.zone_id = input.zone;
    }

    const { data, error } = await supabase
      .from('riders')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating rider:', error);
      throw error;
    }

    return mapRowToRider(data);
  },

  async updateRider(id: string, input: Partial<IRiderInput>): Promise<IRiderResponse> {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.username !== undefined) updatePayload.username = input.username;
    if (input.phone !== undefined) updatePayload.phone = input.phone;
    if (input.available !== undefined) {
      updatePayload.available = input.available;
      updatePayload.is_online = input.available;
    }
    if (input.password) updatePayload.password = input.password;

    if (input.vehicleType) {
      updatePayload.vehicle_details = {
        type: input.vehicleType,
        plate: 'DHAKA-METRO-HA-1234',
      };
    }

    if (input.zone) {
      const { data: zoneData } = await supabase.from('zones').select('title').eq('id', input.zone).maybeSingle();
      const zoneTitle = zoneData?.title || input.zone;
      updatePayload.zone = zoneTitle;
      if (input.zone.length === 36 && input.zone.includes('-')) {
        updatePayload.zone_id = input.zone;
      }
    }

    const { data, error } = await supabase
      .from('riders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating rider:', error);
      throw error;
    }

    return mapRowToRider(data);
  },

  async deleteRider(id: string): Promise<boolean> {
    const { error } = await supabase.from('riders').delete().eq('id', id);
    if (error) {
      console.error('Error deleting rider:', error);
      throw error;
    }
    return true;
  },

  async toggleRiderAvailability(id: string, available: boolean): Promise<IRiderResponse> {
    const { data, error } = await supabase
      .from('riders')
      .update({
        available,
        is_online: available,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling rider availability:', error);
      throw error;
    }

    return mapRowToRider(data);
  },

  async fetchZones(): Promise<IZoneItem[]> {
    try {
      const { data, error } = await supabase.from('zones').select('id, title');
      if (!error && data && data.length > 0) {
        return data.map((z: any) => ({
          _id: z.id,
          title: z.title || 'Zone',
        }));
      }
    } catch (e) {
      console.warn('Could not query zones table', e);
    }
    return [];
  },
};
