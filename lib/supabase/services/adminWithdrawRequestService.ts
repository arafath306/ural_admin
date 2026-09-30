import supabase from '../client';

export const adminWithdrawRequestService = {
  getWithdrawRequests: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('withdraw_requests').select('*, vendors(email), riders(email)', { count: 'exact' });
    
    // search can be complicated here without a direct title, skip basic search or search by status

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    };
  }
};