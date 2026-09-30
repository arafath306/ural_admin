import supabase from '../client';

export const adminBannerService = {
  getBanners: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('banners').select('*', { count: 'exact' });

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
  createBanner: async (bannerData: any) => {
    const { data, error } = await supabase.from('banners').insert([bannerData]).select().single();
    if (error) throw error;
    return data;
  },
  updateBanner: async (id: string, bannerData: any) => {
    const { data, error } = await supabase.from('banners').update(bannerData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteBanner: async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};