import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, signSession } from '@/lib/auth';
import { phoneSchema, otpSchema } from '@/lib/validators';

const schema = z.object({ phone: phoneSchema, otp: otpSchema });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  if (parsed.data.otp !== '0000') {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  }

  const phone = parsed.data.phone.replace(/\s+/g, '');
  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
    include: { pets: { select: { id: true } } },
  });

  const token = await signSession(user.id);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    needsProfile: !user.name || !user.city,
    needsPet: user.pets.length === 0,
  });
}
