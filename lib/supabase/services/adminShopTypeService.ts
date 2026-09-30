import supabase from '../client';

export const adminShopTypeService = {
  getShopTypes: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('shop_types').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
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
  createShopType: async (shopTypeData: any) => {
    const { data, error } = await supabase.from('shop_types').insert([shopTypeData]).select().single();
    if (error) throw error;
    return data;
  },
  updateShopType: async (id: string, shopTypeData: any) => {
    const { data, error } = await supabase.from('shop_types').update(shopTypeData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteShopType: async (id: string) => {
    const { error } = await supabase.from('shop_types').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};