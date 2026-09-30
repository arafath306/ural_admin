import supabase from '../client';

export const adminCouponService = {
  getCoupons: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('coupons').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    };
  },
  createCoupon: async (couponData: any) => {
    const { data, error } = await supabase.from('coupons').insert([couponData]).select().single();
    if (error) throw error;
    return data;
  },
  updateCoupon: async (id: string, couponData: any) => {
    const { data, error } = await supabase.from('coupons').update(couponData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteCoupon: async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};