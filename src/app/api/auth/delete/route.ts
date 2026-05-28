import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { COOKIE_NAME } from '@/lib/auth';
import { requireUserId } from '@/lib/session';

export async function POST() {
  const userId = await requireUserId();
  await prisma.user.delete({ where: { id: userId } });
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
