
import { supabase } from '../client';
export const adminCouponService = {
  async getCoupons(page = 1, pageSize = 10, search = '') {
    let query = supabase.from('coupons').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);
    const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1).order('created_at', { ascending: false });
    if (error) throw error;
    return { data, count: count || 0 };
  },
  async createCoupon(coupon: any) {
    const { data, error } = await supabase.from('coupons').insert([coupon]).select().single();
    if (error) throw error;
    return data;
  },
  async updateCoupon(id: string, coupon: any) {
    const { data, error } = await supabase.from('coupons').update(coupon).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteCoupon(id: string) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  }
};
