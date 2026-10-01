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
      const res = await fetch('/api/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const json = await res.json();
      return (json.data || []).map((v: any) => ({
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
      console.error('Failed to fetch vendors via api:', err);
      return [];
    }
  },

  async createVendor(input: ICreateVendorInput) {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || 'Failed to create vendor');
    }
    return json.data;
  },

  async updateVendor(id: string, input: Partial<ICreateVendorInput>) {
    const res = await fetch('/api/vendors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...input }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || 'Failed to update vendor');
    }
    return json.data;
  },
  async deleteVendor(id: string) {
    const res = await fetch(`/api/vendors?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || 'Failed to delete vendor');
    }
    return json;
  },
};
