import { supabase } from '../client';
import {
  IRestaurantResponse,
  IPaginatedRestaurantResponse,
} from '@/lib/utils/interfaces/restaurant.interface';
import { ICategory } from '@/lib/utils/interfaces/category.interface';
import { IFood } from '@/lib/utils/interfaces/food.interface';

export interface ICreateStoreInput {
  name: string;
  username: string;
  password?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryTime?: number;
  minOrder?: number;
  salesTax?: number;
  tax?: number;
  commissionRate?: number;
  image?: string;
  logo?: string;
  cuisines?: string[];
  vendorId?: string;
  coordinates?: [number, number];
}

function mapRowToRestaurant(r: any): IRestaurantResponse {
  const fallbackImage =
    'https://images.unsplash.com/photo-1595418917831-ef942bd9f9ec?q=80&w=2670&auto=format&fit=crop';
  const name = r.name || 'Store';
  const prefix =
    r.order_prefix ||
    name
      .replace(/[^A-Za-z]/g, '')
      .substring(0, 3)
      .toUpperCase() ||
    'ORD';

  return {
    _id: r.id,
    unique_restaurant_id: r.id ? r.id.substring(0, 8).toUpperCase() : 'REST-001',
    name: name,
    image: r.image || fallbackImage,
    orderPrefix: prefix,
    slug: r.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    address: r.address || 'Dhaka, Bangladesh',
    deliveryTime: Number(r.delivery_time || 30),
    minimumOrder: Number(r.minimum_order || 100),
    isActive: Boolean(r.is_active),
    commissionRate: Number(r.commission_rate || 10),
    tax: Number(r.tax || r.sales_tax || 5),
    username: r.username || r.email || '',
    owner: {
      _id: r.vendor_id || '22222222-2222-2222-2222-222222222222',
      email: r.email || (r.username ? `${r.username}@vendor.ural.com` : 'vendor@ural.com'),
      isActive: true,
      __typename: 'Owner',
    },
    shopType: 'restaurant',
    __typename: 'Restaurant',
  };
}

export const adminStoreService = {
  async fetchRestaurantsPaginated({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    tab?: string;
  }): Promise<IPaginatedRestaurantResponse> {
    try {
      let query = supabase.from('restaurants').select('*', { count: 'exact' });

      if (search && search.trim()) {
        const term = search.trim();
        query = query.or(`name.ilike.%${term}%,username.ilike.%${term}%,address.ilike.%${term}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching restaurants:', error);
        return {
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 1,
        };
      }

      const mapped = (data || []).map(mapRowToRestaurant);
      const totalCount = count ?? mapped.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      return {
        data: mapped,
        totalCount,
        currentPage: page,
        totalPages,
      };
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
      return {
        data: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
      };
    }
  },

  async fetchRestaurantById(id: string): Promise<IRestaurantResponse | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching restaurant by id:', error);
        return null;
      }
      return mapRowToRestaurant(data);
    } catch (err) {
      console.error('Failed to fetch restaurant by id:', err);
      return null;
    }
  },

  async createRestaurant(input: ICreateStoreInput): Promise<IRestaurantResponse> {
    const coords = input.coordinates || [90.4125, 23.7781];
    const name = input.name;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const insertPayload: any = {
      name: name,
      username: input.username,
      slug: slug,
      email: input.email || `${input.username}@vendor.ural.com`,
      phone: input.phoneNumber || input.phone || '',
      address: input.address || 'Dhaka, Bangladesh',
      location: {
        type: 'Point',
        coordinates: coords,
      },
      delivery_time: Number(input.deliveryTime || 30),
      minimum_order: Number(input.minOrder || 100),
      tax: Number(input.salesTax || input.tax || 5),
      commission_rate: Number(input.commissionRate || 10),
      is_active: true,
      is_available: true,
      image:
        input.image ||
        'https://images.unsplash.com/photo-1595418917831-ef942bd9f9ec?q=80&w=2670&auto=format&fit=crop',
      logo:
        input.logo ||
        'https://res.cloudinary.com/dc6xw0lzg/image/upload/v1735894342/dvi5fjbsgdlrzwip0whg.jpg',
      cuisines: Array.isArray(input.cuisines)
        ? input.cuisines
        : input.cuisines
        ? [input.cuisines]
        : ['Multi-Cuisine'],
      categories: [],
      foods: [],
      vendor_id: input.vendorId || '22222222-2222-2222-2222-222222222222',
      zone_id: '11111111-1111-1111-1111-111111111111',
    };

    if (input.password) {
      insertPayload.password = input.password;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }

    return mapRowToRestaurant(data);
  },

  async updateRestaurant(id: string, input: Partial<ICreateStoreInput>): Promise<IRestaurantResponse> {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.username !== undefined) updatePayload.username = input.username;
    if (input.address !== undefined) updatePayload.address = input.address;
    if (input.deliveryTime !== undefined) updatePayload.delivery_time = Number(input.deliveryTime);
    if (input.minOrder !== undefined) updatePayload.minimum_order = Number(input.minOrder);
    if (input.salesTax !== undefined) updatePayload.tax = Number(input.salesTax);
    if (input.commissionRate !== undefined) updatePayload.commission_rate = Number(input.commissionRate);
    if (input.image !== undefined) updatePayload.image = input.image;
    if (input.logo !== undefined) updatePayload.logo = input.logo;
    if (input.cuisines !== undefined) updatePayload.cuisines = input.cuisines;

    if (input.coordinates) {
      updatePayload.location = {
        type: 'Point',
        coordinates: input.coordinates,
      };
    }

    const { data, error } = await supabase
      .from('restaurants')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }

    return mapRowToRestaurant(data);
  },

  async toggleRestaurantStatus(id: string, isActive: boolean): Promise<IRestaurantResponse> {
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling restaurant status:', error);
      throw error;
    }

    return mapRowToRestaurant(data);
  },

  async deleteRestaurant(id: string): Promise<boolean> {
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
    return true;
  },

  async fetchVendors(): Promise<{ _id: string; email: string }[]> {
    try {
      const { data, error } = await supabase.from('vendors').select('id, email');
      if (!error && data && data.length > 0) {
        return data.map((v: any) => ({
          _id: v.id,
          email: v.email || 'vendor@ural.com',
        }));
      }
    } catch (e) {
      console.warn('Could not query vendors table:', e);
    }
    return [
      { _id: '22222222-2222-2222-2222-222222222222', email: 'vendor@ural.com' },
      { _id: '22222222-2222-2222-2222-222222222223', email: 'foodvendor@ural.com' },
    ];
  },

  // Menu / Categories
  async fetchCategories(restaurantId: string): Promise<ICategory[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('categories')
        .eq('id', restaurantId)
        .maybeSingle();

      if (!error && data && Array.isArray(data.categories)) {
        return data.categories;
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
    return [];
  },

  async saveCategories(restaurantId: string, categories: ICategory[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          categories: categories,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Error saving categories:', error);
        throw error;
      }
      return true;
    } catch (e) {
      console.error('Failed to save categories:', e);
      throw e;
    }
  },

  // Menu / Foods
  async fetchFoods(restaurantId: string): Promise<IFood[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('foods')
        .eq('id', restaurantId)
        .maybeSingle();

      if (!error && data && Array.isArray(data.foods)) {
        return data.foods;
      }
    } catch (e) {
      console.error('Error fetching foods:', e);
    }
    return [];
  },

  async saveFoods(restaurantId: string, foods: IFood[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          foods: foods,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurantId);

      if (error) {
        console.error('Error saving foods:', error);
        throw error;
      }
      return true;
    } catch (e) {
      console.error('Failed to save foods:', e);
      throw e;
    }
  },
};
