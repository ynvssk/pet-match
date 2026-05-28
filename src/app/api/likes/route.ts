import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { z } from 'zod';

const schema = z.object({
  petId: z.string().min(1),
  action: z.enum(['LIKE', 'PASS']),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { petId, action } = parsed.data;

  const targetPet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true, ownerId: true, name: true, photos: { orderBy: { order: 'asc' }, take: 1 } },
  });
  if (!targetPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
  if (targetPet.ownerId === userId) return NextResponse.json({ error: "Can't like own pet" }, { status: 400 });

  await prisma.like.upsert({
    where: { likerId_likedPetId: { likerId: userId, likedPetId: petId } },
    update: { action },
    create: { likerId: userId, likedPetId: petId, action },
  });

  if (action === 'PASS') return NextResponse.json({ ok: true, match: null });

  const myPet = await prisma.pet.findFirst({
    where: { ownerId: userId, isActive: true },
    select: { id: true, name: true, photos: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'asc' },
  });
  if (!myPet) return NextResponse.json({ ok: true, match: null });

  // MVP demo: insta-match on LIKE (no need to wait for reciprocal like).
  const [u1, u2] = [userId, targetPet.ownerId].sort();
  const p1 = u1 === userId ? myPet.id : targetPet.id;
  const p2 = u1 === userId ? targetPet.id : myPet.id;

  const match = await prisma.match.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    update: {},
    create: { user1Id: u1, user2Id: u2, pet1Id: p1, pet2Id: p2 },
  });

  return NextResponse.json({
    ok: true,
    match: {
      id: match.id,
      otherPet: { id: targetPet.id, name: targetPet.name, photo: targetPet.photos[0]?.url ?? null },
      myPet: { id: myPet.id, name: myPet.name, photo: myPet.photos[0]?.url ?? null },
    },
  });
}
