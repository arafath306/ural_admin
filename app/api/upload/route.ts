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

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let extension = 'jpg';
    let folder = 'uploads';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }
      folder = (formData.get('folder') as string) || 'uploads';
      mimeType = file.type || 'image/jpeg';
      extension = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      const base64Data = body.image || body.file;
      if (!base64Data) {
        return NextResponse.json({ error: 'No image or file provided' }, { status: 400 });
      }
      folder = body.folder || 'uploads';

      // Parse data URI if present (e.g. data:image/png;base64,iVBOR...)
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        extension = mimeType.split('/')[1] || 'jpg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }
    }

    // Always upload to the public 'images' bucket
    const bucket = 'images';
    // Clean folder name to remove special chars
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${cleanFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(uniqueFilename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(uniqueFilename);
    const publicUrl = urlData.publicUrl;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      imageUrl: publicUrl,
      data: {
        uploadImageToS3: {
          imageUrl: publicUrl,
        },
      },
    });
  } catch (err: any) {
    console.error('API upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
