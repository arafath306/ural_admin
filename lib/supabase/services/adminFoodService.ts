import supabase from '../client';

export const adminFoodService = {
  getFoods: async (restaurantId: string, page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('foods').select('*, categories(title)', { count: 'exact' });
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / limit), currentPage: page };
  },
  createFood: async (dataObj: any) => {
    const { data, error } = await supabase.from('foods').insert([dataObj]).select().single();
    if (error) throw error;
    return data;
  },
  updateFood: async (id: string, dataObj: any) => {
    const { data, error } = await supabase.from('foods').update(dataObj).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteFood: async (id: string) => {
    const { error } = await supabase.from('foods').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};