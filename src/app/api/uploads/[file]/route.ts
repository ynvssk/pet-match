import { NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // Prevent path traversal
  if (file.includes('/') || file.includes('\\') || file.includes('..')) {
    return new NextResponse('Bad request', { status: 400 });
  }
  const full = path.join(UPLOAD_DIR, file);
  try {
    await stat(full);
    const buf = await readFile(full);
    const ext = path.extname(file).toLowerCase();
    const arr = new Uint8Array(buf);
    return new NextResponse(arr, {
      headers: {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
