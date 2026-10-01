import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://takstvzqfqykhesdmkzf.supabase.co';
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3N0dnpxZnF5a2hlc2Rta3pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQyNzk3NywiZXhwIjoyMTA2MDAzOTc3fQ.Gh-Er4yA3bty5Jj5_NlsQG-2PuRU5jjGHNN9WdrgReU';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API GET vendors error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('API GET vendors exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, phone } = body;

    const payload: any = {
      name: name || 'Vendor',
      email: email,
      phone: phoneNumber || phone || '',
      is_active: true,
    };

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('API POST vendor error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API POST vendor exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, phoneNumber, phone } = body;

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phoneNumber || phone) updates.phone = phoneNumber || phone;

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('API PUT vendor error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API PUT vendor exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
