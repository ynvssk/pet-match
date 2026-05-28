import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { petSchema } from '@/lib/validators';

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { photoUrls, ...data } = parsed.data;
  const pet = await prisma.pet.create({
    data: {
      ...data,
      ownerId: userId,
      photos: { create: photoUrls.map((url, order) => ({ url, order })) },
    },
    include: { photos: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json({ pet });
}
