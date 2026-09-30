import supabase from '../client';

export const adminTippingService = {
  getTippings: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('tippings').select('*, orders(order_id), riders(email, name)', { count: 'exact' });

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / limit), currentPage: page };
  }
};