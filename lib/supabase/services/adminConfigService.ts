import { supabase } from '../client';
import { IConfiguration } from '@/lib/utils/interfaces';

export const DEFAULT_CONFIG: Partial<IConfiguration> = {
  currency: 'BDT',
  currencySymbol: '৳',
  deliveryRate: 50,
  costType: 'fixed',
  email: 'admin@ural.com',
  emailName: 'Ural Delivery',
  enableEmail: true,
  twilioEnabled: false,
  skipEmailVerification: true,
  skipMobileVerification: true,
};

const LOCAL_STORAGE_KEY = 'ural_admin_configurations';

export const adminConfigService = {
  async fetchConfiguration(): Promise<Partial<IConfiguration>> {
    let cached: any = null;
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (item) cached = JSON.parse(item);
      } catch (e) {
        console.warn('Failed to parse cached configuration:', e);
      }
    }

    try {
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const merged: Partial<IConfiguration> = {
          ...DEFAULT_CONFIG,
          ...cached,
          currency: row.currency || 'BDT',
          currencySymbol: row.currency_symbol || '৳',
          deliveryRate: Number(row.delivery_rate ?? 50),
          costType: row.cost_type || 'fixed',
          email: row.email || 'admin@ural.com',
          emailName: row.email_name || 'Ural Delivery',
          enableEmail: row.enable_email ?? true,
          twilioAccountSid: row.twilio_account_sid || '',
          twilioAuthToken: row.twilio_auth_token || '',
          twilioPhoneNumber: row.twilio_phone_number || '',
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch configurations from Supabase, using cache/defaults:', err);
    }

    return cached ? { ...DEFAULT_CONFIG, ...cached } : DEFAULT_CONFIG;
  },

  async updateConfiguration(updates: Partial<IConfiguration>): Promise<boolean> {
    // 1. Update localStorage
    if (typeof window !== 'undefined') {
      try {
        const current = await this.fetchConfiguration();
        const merged = { ...current, ...updates };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to cache configuration:', e);
      }
    }

    // 2. Map to Supabase table columns
    const payload: any = {};
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.currencySymbol !== undefined) payload.currency_symbol = updates.currencySymbol;
    if (updates.deliveryRate !== undefined) payload.delivery_rate = updates.deliveryRate;
    if (updates.costType !== undefined) payload.cost_type = updates.costType;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.emailName !== undefined) payload.email_name = updates.emailName;
    if (updates.enableEmail !== undefined) payload.enable_email = updates.enableEmail;
    if (updates.twilioAccountSid !== undefined) payload.twilio_account_sid = updates.twilioAccountSid;
    if (updates.twilioAuthToken !== undefined) payload.twilio_auth_token = updates.twilioAuthToken;
    if (updates.twilioPhoneNumber !== undefined) payload.twilio_phone_number = updates.twilioPhoneNumber;
    payload.updated_at = new Date().toISOString();

    try {
      const { data: existing } = await supabase.from('configurations').select('id').limit(1);
      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('configurations')
          .update(payload)
          .eq('id', existing[0].id);
        if (error) console.warn('Supabase configuration update warning:', error.message);
      } else {
        const { error } = await supabase
          .from('configurations')
          .insert([payload]);
        if (error) console.warn('Supabase configuration insert warning:', error.message);
      }
    } catch (err) {
      console.warn('Could not persist to Supabase configurations table (likely RLS), saved to client storage:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ural-config-updated'));
    }

    return true;
  },
};
