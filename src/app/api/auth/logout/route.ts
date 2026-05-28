import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}

// GET form so server-side redirects can clear the cookie without a fetch from the client.
export async function GET(req: Request) {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  const url = new URL('/login', req.url);
  return NextResponse.redirect(url);
}
