import supabase from '../client';

export const adminCommissionRateService = {
  getCommissionRates: async (page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('restaurants').select('id, name, slug, logo, image, commission_rate, address, is_active', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order(sortBy === 'commissionRate' ? 'commission_rate' : 'name', { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    };
  },
  updateCommissionRate: async (id: string, commission_rate: number) => {
    const { data, error } = await supabase.from('restaurants').update({ commission_rate }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};