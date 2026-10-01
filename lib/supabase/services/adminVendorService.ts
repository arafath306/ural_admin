import { supabase } from '../client';

export interface ICreateVendorInput {
  name: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  image?: string;
}

export const adminVendorService = {
  async fetchVendors() {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error);
        return [];
      }

      return (data || []).map((v: any) => ({
        _id: v.id,
        id: v.id,
        name: v.name || 'Vendor',
        email: v.email,
        phoneNumber: v.phone || '',
        image: v.image || '',
        userType: 'VENDOR',
        isActive: v.is_active ?? true,
      }));
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      return [];
    }
  },

  async createVendor(input: ICreateVendorInput) {
    const payload: any = {
      name: input.name,
      email: input.email,
      phone: input.phoneNumber || '',
      is_active: true,
    };

    const { data, error } = await supabase
      .from('vendors')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase create vendor error:', error);
      throw new Error(error.message || 'Failed to create vendor in database');
    }

    return data;
  },

  async updateVendor(id: string, input: Partial<ICreateVendorInput>) {
    const updates: any = {};
    if (input.name) updates.name = input.name;
    if (input.email) updates.email = input.email;
    if (input.phoneNumber) updates.phone = input.phoneNumber;

    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update vendor error:', error);
      throw new Error(error.message || 'Failed to update vendor in database');
    }

    return data;
  },
};
