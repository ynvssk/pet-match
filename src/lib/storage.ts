import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'pet-photos';

// Supabase Storage in deployed envs (Vercel's filesystem is ephemeral),
// local disk for dev when no Supabase credentials are configured.
export function usingSupabaseStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function saveImage(buf: Buffer, ext: string, contentType: string): Promise<string> {
  const filename = `${randomUUID()}.${ext}`;

  if (usingSupabaseStorage()) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.storage.from(BUCKET).upload(filename, buf, {
      contentType,
      upsert: false,
    });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buf);
  return `/api/uploads/${filename}`;
}
