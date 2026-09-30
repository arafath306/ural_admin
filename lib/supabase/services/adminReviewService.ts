import supabase from '../client';

export const adminReviewService = {
  getReviews: async (restaurantId: string, page = 1, limit = 10, search = '', minRating?: number, maxRating?: number) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('reviews').select('*, orders(order_id), users(name, email, phone)', { count: 'exact' });
    
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    if (search) query = query.ilike('description', `%${search}%`);
    if (minRating !== undefined) query = query.gte('rating', minRating);
    if (maxRating !== undefined) query = query.lte('rating', maxRating);

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