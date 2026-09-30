import supabase from '../client';

export const adminCuisineService = {
  getCuisines: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('cuisines').select('*, shop_types(name)', { count: 'exact' });

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
  createCuisine: async (cuisineData: any) => {
    const { data, error } = await supabase.from('cuisines').insert([cuisineData]).select().single();
    if (error) throw error;
    return data;
  },
  updateCuisine: async (id: string, cuisineData: any) => {
    const { data, error } = await supabase.from('cuisines').update(cuisineData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteCuisine: async (id: string) => {
    const { error } = await supabase.from('cuisines').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};