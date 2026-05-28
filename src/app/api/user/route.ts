import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { userProfileSchema } from '@/lib/validators';

export async function GET() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { pets: { include: { photos: { orderBy: { order: 'asc' } } } } },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = userProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  });
  return NextResponse.json({ user });
}
