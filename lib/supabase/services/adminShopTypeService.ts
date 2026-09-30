
import { supabase } from '../client';
export const adminShopTypeService = {
  async getShopTypes(page = 1, pageSize = 10, search = '') {
    let query = supabase.from('shop_types').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);
    const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1).order('created_at', { ascending: false });
    if (error) throw error;
    return { data, count: count || 0 };
  },
  async createShopType(type: any) {
    const { data, error } = await supabase.from('shop_types').insert([type]).select().single();
    if (error) throw error;
    return data;
  },
  async updateShopType(id: string, type: any) {
    const { data, error } = await supabase.from('shop_types').update(type).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteShopType(id: string) {
    const { error } = await supabase.from('shop_types').delete().eq('id', id);
    if (error) throw error;
  }
};
