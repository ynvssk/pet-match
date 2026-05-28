import { NextResponse } from 'next/server';
import { phoneSchema } from '@/lib/validators';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = phoneSchema.safeParse(body?.phone);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  // Mock OTP — always "0000". No SMS sent.
  return NextResponse.json({ ok: true, hint: 'Use code 0000' });
}
