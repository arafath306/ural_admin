import supabase from '../client';

export const adminAuditLogService = {
  getAuditLogs: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('audit_logs').select('*, users(email)', { count: 'exact' });

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / limit), currentPage: page };
  }
};