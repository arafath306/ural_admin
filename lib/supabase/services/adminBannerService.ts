
import { supabase } from '../client';
export const adminBannerService = {
  async getBanners(page = 1, pageSize = 10, search = '') {
    let query = supabase.from('banners').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);
    const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1).order('created_at', { ascending: false });
    if (error) throw error;
    return { data, count: count || 0 };
  },
  async createBanner(banner: any) {
    const { data, error } = await supabase.from('banners').insert([banner]).select().single();
    if (error) throw error;
    return data;
  },
  async updateBanner(id: string, banner: any) {
    const { data, error } = await supabase.from('banners').update(banner).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteBanner(id: string) {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
  }
};
