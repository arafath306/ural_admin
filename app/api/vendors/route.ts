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
    const { name, email, phoneNumber, phone, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Create or link user in Supabase Auth
    let authUserId: string | null = null;

    if (password) {
      try {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password: password,
          email_confirm: true,
          user_metadata: {
            name: name || 'Vendor',
            role: 'vendor',
            userType: 'VENDOR',
          },
        });

        if (authData?.user) {
          authUserId = authData.user.id;
        } else if (authErr) {
          console.warn('Auth user creation warning (might already exist):', authErr.message);
          // Find existing user if email already registered
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = listData?.users?.find(
            (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
          );
          if (existing) {
            authUserId = existing.id;
          }
        }
      } catch (authException) {
        console.warn('Error creating Auth user:', authException);
      }
    }

    // 2. Insert into vendors table
    const payload: any = {
      name: name || 'Vendor',
      email: email.trim().toLowerCase(),
      phone: phoneNumber || phone || '',
      is_active: true,
      user_id: authUserId,
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

    return NextResponse.json({ success: true, data, authUserId });
  } catch (err: any) {
    console.error('API POST vendor exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, phoneNumber, phone, password } = body;

    // If password provided, update user in Supabase Auth if we have user_id
    if (password && id) {
      try {
        const { data: existingVendor } = await supabaseAdmin
          .from('vendors')
          .select('user_id, email')
          .eq('id', id)
          .single();

        if (existingVendor?.user_id) {
          await supabaseAdmin.auth.admin.updateUserById(existingVendor.user_id, {
            password,
          });
        }
      } catch (authErr) {
        console.warn('Could not update Auth password:', authErr);
      }
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email.trim().toLowerCase();
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const { data: vendorData } = await supabaseAdmin
      .from('vendors')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (vendorData?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(vendorData.user_id).catch(() => {});
    }

    const { error } = await supabaseAdmin
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('API DELETE vendor error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (err: any) {
    console.error('API DELETE vendor exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
