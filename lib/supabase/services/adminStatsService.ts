import { supabase } from '../client';

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSales: number;
  totalRestaurants: number;
  totalRiders: number;
  onlineRiders: number;
}

export const adminStatsService = {
  async fetchDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [ordersRes, restRes, riderRes] = await Promise.all([
        supabase.from('orders').select('order_status, total_amount, order_amount'),
        supabase.from('restaurants').select('id, is_active'),
        supabase.from('riders').select('id, is_online'),
      ]);

      const orders = ordersRes.data || [];
      const restaurants = restRes.data || [];
      const riders = riderRes.data || [];

      let totalSales = 0;
      let pendingOrders = 0;
      let inProgressOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;

      for (const ord of orders) {
        const amount = Number(ord.total_amount || ord.order_amount || 0);
        totalSales += amount;

        const status = ord.order_status?.toUpperCase();
        if (status === 'PENDING') pendingOrders++;
        else if (status === 'DELIVERED') deliveredOrders++;
        else if (status === 'CANCELLED') cancelledOrders++;
        else inProgressOrders++; // ACCEPTED, READY, ASSIGNED, PICKED
      }

      const onlineRiders = riders.filter((r) => r.is_online).length;

      return {
        totalOrders: orders.length,
        pendingOrders,
        inProgressOrders,
        deliveredOrders,
        cancelledOrders,
        totalSales,
        totalRestaurants: restaurants.length,
        totalRiders: riders.length,
        onlineRiders,
      };
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSales: 0,
        totalRestaurants: 0,
        totalRiders: 0,
        onlineRiders: 0,
      };
    }
  },
};
