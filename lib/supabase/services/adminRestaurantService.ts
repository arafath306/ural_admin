import { supabase } from '../client';

export interface AdminRestaurantItem {
  _id: string;
  id: string;
  name: string;
  address: string;
  phone: string;
  image_url?: string;
  is_active: boolean;
  rating: number;
}

export const adminRestaurantService = {
  async fetchRestaurants(): Promise<AdminRestaurantItem[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }

      return (data || []).map((r) => ({
        _id: r.id,
        id: r.id,
        name: r.name,
        address: r.address || '',
        phone: r.phone || '',
        image_url: r.image_url || '',
        is_active: Boolean(r.is_active),
        rating: Number(r.rating || 5.0),
      }));
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
      return [];
    }
  },
};
