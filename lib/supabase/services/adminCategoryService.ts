import supabase from '../client';

export const adminCategoryService = {
  getCategories: async (restaurantId: string, page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('categories').select('*', { count: 'exact' });
    
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    };
  },
  createCategory: async (dataObj: any) => {
    const { data, error } = await supabase.from('categories').insert([dataObj]).select().single();
    if (error) throw error;
    return data;
  },
  updateCategory: async (id: string, dataObj: any) => {
    const { data, error } = await supabase.from('categories').update(dataObj).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteCategory: async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};