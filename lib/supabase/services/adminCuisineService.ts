
import { supabase } from '../client';
export const adminCuisineService = {
  async getCuisines(page = 1, pageSize = 10, search = '') {
    let query = supabase.from('cuisines').select('*', { count: 'exact' });
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1).order('created_at', { ascending: false });
    if (error) throw error;
    return { data, count: count || 0 };
  },
  async createCuisine(cuisine: any) {
    const { data, error } = await supabase.from('cuisines').insert([cuisine]).select().single();
    if (error) throw error;
    return data;
  },
  async updateCuisine(id: string, cuisine: any) {
    const { data, error } = await supabase.from('cuisines').update(cuisine).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteCuisine(id: string) {
    const { error } = await supabase.from('cuisines').delete().eq('id', id);
    if (error) throw error;
  }
};
