import { supabase } from '../client';
import { extractLatLngPoints, pointsToGeoJSON } from '@/lib/utils/methods';
import { DEFAULT_POLYGON } from '@/lib/utils/constants';

function mapRow(r: any) {
  return {
    _id: r.id as string,
    id: r.id as string,
    title: (r.title as string) || '',
    description: (r.description as string) || '',
    location: r.location || null,
    isActive: r.is_active !== false,
    is_active: r.is_active !== false,
    __typename: 'Zone',
  };
}

export function buildGeoJSON(coordinates?: any) {
  const points = extractLatLngPoints(coordinates);
  if (points.length >= 3) {
    return {
      type: 'Polygon',
      coordinates: pointsToGeoJSON(points),
    };
  }
  return {
    type: 'Polygon',
    coordinates: pointsToGeoJSON(DEFAULT_POLYGON),
  };
}

export const adminZoneService = {
  async fetchZones() {
    const { data, error } = await supabase.from('zones').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Failed to fetch zones:', error); return []; }
    return (data || []).map(mapRow);
  },

  async fetchZonesPaginated(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase.from('zones').select('*', { count: 'exact' });
    if (params.search) {
      query = query.or('title.ilike.%' + params.search + '%,description.ilike.%' + params.search + '%') as any;
    }
    const { data, error, count } = await (query as any).order('created_at', { ascending: false }).range(from, to);
    if (error) { return { data: [], totalCount: 0, currentPage: page, totalPages: 1 }; }
    const totalCount = count || 0;
    return { data: (data || []).map(mapRow), totalCount, currentPage: page, totalPages: Math.max(1, Math.ceil(totalCount / limit)) };
  },

  async createZone(input: { title: string; description: string; coordinates?: any }) {
    const location = buildGeoJSON(input.coordinates);
    const { data, error } = await supabase.from('zones').insert({ title: input.title, description: input.description, location, is_active: true }).select().single();
    if (error) throw new Error(error.message || 'Failed to create zone');
    return mapRow(data);
  },

  async updateZone(id: string, input: { title: string; description: string; coordinates?: any }) {
    const updates: any = { title: input.title, description: input.description, updated_at: new Date().toISOString() };
    if (input.coordinates) {
      const points = extractLatLngPoints(input.coordinates);
      if (points.length >= 3) {
        updates.location = buildGeoJSON(points);
      }
    }
    const { data, error } = await supabase.from('zones').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message || 'Failed to update zone');
    return mapRow(data);
  },

  async deleteZone(id: string) {
    const { error } = await supabase.from('zones').delete().eq('id', id);
    if (error) throw new Error(error.message || 'Failed to delete zone');
  },
};

export default adminZoneService;