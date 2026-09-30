import supabase from '../client';

export const adminNotificationService = {
  getNotifications: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('notifications').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / limit), currentPage: page };
  }
};