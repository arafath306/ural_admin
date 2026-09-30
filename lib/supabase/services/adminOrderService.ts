import { supabase } from '../client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { IActiveOrders } from '@/lib/utils/interfaces/dispatch.interface';
import { IExtendedOrder } from '@/lib/utils/interfaces';

export function mapSupabaseOrderToActiveOrder(row: any): IActiveOrders {
  const customerName = row.customer_name || 'Customer';
  const customerPhone = row.customer_phone || '';
  const restaurantName = row.restaurant_name || row.restaurant?.name || 'Restaurant';
  const restaurantAddress = row.restaurant_address || row.restaurant?.address || 'Dhaka, Bangladesh';
  const deliveryAddressStr =
    typeof row.delivery_address === 'string'
      ? row.delivery_address
      : row.delivery_address?.deliveryAddress || 'Dhaka, Bangladesh';

  return {
    _id: row.id,
    orderId: row.order_id || row.id?.slice(0, 8).toUpperCase(),
    isPickedUp: Boolean(row.is_picked_up),
    zone: {
      _id: row.zone_id || 'zone-default',
    },
    deliveryAddress: {
      location: {
        coordinates: {
          latitude: row.customer_lat || 23.8103,
          longitude: row.customer_lng || 90.4125,
        },
      },
      deliveryAddress: deliveryAddressStr,
      details: row.special_instructions || '',
      label: 'Delivery Address',
    },
    items: Array.isArray(row.items) ? row.items : [],
    paymentMethod: row.payment_method || 'COD',
    paidAmount: Number(row.paid_amount || 0),
    orderAmount: Number(row.order_amount || row.total_amount || 0),
    orderStatus: row.order_status || 'PENDING',
    status: row.order_status || 'PENDING',
    paymentStatus: row.payment_status || 'PENDING',
    reason: row.reason || null,
    isActive: row.order_status !== 'DELIVERED' && row.order_status !== 'CANCELLED',
    createdAt: row.created_at || new Date().toISOString(),
    deliveryCharges: Number(row.delivery_charges || 0),
    tipping: Number(row.tip || row.tipping || 0),
    preparationTime: row.preparation_time ? `${row.preparation_time} mins` : '20 mins',
    restaurant: {
      _id: row.restaurant_id || '',
      name: restaurantName,
      address: restaurantAddress,
      image: row.restaurant?.image_url || '',
      location: {
        coordinates: [row.restaurant_lng || 90.4125, row.restaurant_lat || 23.8103],
      },
    },
    user: {
      _id: row.user_id || '',
      name: customerName,
      phone: customerPhone,
      email: row.customer_email || '',
    },
    rider: row.rider_id
      ? {
          _id: row.rider_id,
          name: row.rider_name || row.rider?.name || 'Assigned Rider',
          username: (row.rider_name || 'rider').toLowerCase().replace(/\s+/g, '_'),
          available: true,
        }
      : undefined,
    eta: {
      estimatedArrivalAt: row.expected_time || undefined,
      source: 'Supabase Realtime',
      calculatedAt: row.updated_at || row.created_at,
    },
  };
}

export function mapSupabaseOrderToExtendedOrder(row: any): IExtendedOrder {
  const active = mapSupabaseOrderToActiveOrder(row);
  return {
    ...active,
    orderId: active.orderId,
    _id: active._id,
    orderStatus: active.orderStatus,
    paymentMethod: active.paymentMethod,
    paidAmount: active.paidAmount ?? 0,
    orderAmount: active.orderAmount ?? 0,
    deliveryCharges: active.deliveryCharges ?? 0,
    tipping: active.tipping ?? 0,
    taxationAmount: 0,
    createdAt: active.createdAt,
    completionTime: row.delivered_at || '',
    restaurant: active.restaurant ? {
      _id: active.restaurant._id,
      name: active.restaurant.name,
      address: active.restaurant.address ?? '',
      image: active.restaurant.image ?? '',
    } : undefined,
    user: active.user ? {
      _id: active.user._id ?? '',
      name: active.user.name,
      phone: active.user.phone ?? '',
      email: active.user.email ?? '',
    } : undefined,
    items: active.items.map((it: any) => ({
      _id: it.id || it._id || Math.random().toString(),
      food: it.title || it.name || 'Food Item',
      title: it.title || it.name || 'Food Item',
      variation: it.variation || { _id: '1', title: 'Standard', price: it.price || 0 },
      addons: it.addons || [],
      specialInstructions: it.special_instructions || '',
      quantity: it.quantity || 1,
    })),
  } as unknown as IExtendedOrder;
}

export const adminOrderService = {
  async fetchActiveOrders(params?: {
    page?: number;
    rowsPerPage?: number;
    search?: string;
    actions?: string[];
    restaurantId?: string;
  }): Promise<{ orders: IActiveOrders[]; totalCount: number }> {
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      // Filter by status if provided
      if (params?.actions && params.actions.length > 0) {
        query = query.in('order_status', params.actions);
      }

      // Filter by restaurant if provided
      if (params?.restaurantId) {
        query = query.eq('restaurant_id', params.restaurantId);
      }

      // Filter by search string
      if (params?.search && params.search.trim()) {
        const s = params.search.trim();
        query = query.or(`order_id.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,restaurant_name.ilike.%${s}%`);
      }

      query = query.order('created_at', { ascending: false });

      // Pagination
      const page = params?.page || 1;
      const limit = params?.rowsPerPage || 15;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) {
        console.error('Error fetching admin active orders:', error);
        return { orders: [], totalCount: 0 };
      }

      const orders = (data || []).map(mapSupabaseOrderToActiveOrder);
      return { orders, totalCount: count || orders.length };
    } catch (err) {
      console.error('Failed to query admin active orders:', err);
      return { orders: [], totalCount: 0 };
    }
  },

  async fetchAllOrders(params?: {
    page?: number;
    rows?: number;
    orderStatus?: string[];
    search?: string;
    restaurantId?: string;
    riderId?: string;
    starting_date?: string;
    ending_date?: string;
  }): Promise<{ orders: IExtendedOrder[]; totalCount: number }> {
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      if (params?.orderStatus && params.orderStatus.length > 0) {
        query = query.in('order_status', params.orderStatus);
      }

      if (params?.restaurantId) {
        query = query.eq('restaurant_id', params.restaurantId);
      }

      if (params?.riderId) {
        query = query.eq('rider_id', params.riderId);
      }

      if (params?.starting_date) {
        query = query.gte('created_at', params.starting_date);
      }

      if (params?.ending_date) {
        query = query.lte('created_at', params.ending_date + 'T23:59:59Z');
      }

      if (params?.search && params.search.trim()) {
        const s = params.search.trim();
        query = query.or(`order_id.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,restaurant_name.ilike.%${s}%`);
      }

      query = query.order('created_at', { ascending: false });

      const page = params?.page || 1;
      const limit = params?.rows || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) {
        console.error('Error fetching admin all orders:', error);
        return { orders: [], totalCount: 0 };
      }

      const orders = (data || []).map(mapSupabaseOrderToExtendedOrder);
      return { orders, totalCount: count || orders.length };
    } catch (err) {
      console.error('Failed to query all orders:', err);
      return { orders: [], totalCount: 0 };
    }
  },

  async updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
    try {
      const updates: any = {
        order_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'ACCEPTED') updates.accepted_at = new Date().toISOString();
      if (newStatus === 'ASSIGNED') updates.assigned_at = new Date().toISOString();
      if (newStatus === 'PICKED') {
        updates.picked_at = new Date().toISOString();
        updates.is_picked_up = true;
      }
      if (newStatus === 'DELIVERED') {
        updates.delivered_at = new Date().toISOString();
        updates.payment_status = 'PAID';
      }
      if (newStatus === 'CANCELLED') updates.cancelled_at = new Date().toISOString();

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to update order status:', err);
      return false;
    }
  },

  async assignRider(orderId: string, riderId: string): Promise<boolean> {
    try {
      // 1. Fetch rider info
      const { data: rider, error: riderErr } = await supabase
        .from('riders')
        .select('name, phone')
        .eq('id', riderId)
        .single();

      const riderName = rider?.name || 'Rider';
      const riderPhone = rider?.phone || '';

      // 2. Update order
      const { error } = await supabase
        .from('orders')
        .update({
          rider_id: riderId,
          rider_name: riderName,
          rider_phone: riderPhone,
          order_status: 'ASSIGNED',
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error assigning rider in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to assign rider:', err);
      return false;
    }
  },

  subscribeToLiveOrders(onAnyChange: () => void): RealtimeChannel {
    const channel = supabase
      .channel('admin-dispatch-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          onAnyChange();
        }
      )
      .subscribe();

    return channel;
  },
};
