import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

export async function GET() {
  const userId = await requireUserId();
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { city: true } });
  if (!me?.city) return NextResponse.json({ pets: [] });

  const [actionedPetIds, blocked, blockedBy] = await Promise.all([
    prisma.like.findMany({ where: { likerId: userId }, select: { likedPetId: true } }),
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ]);
  const excludePetIds = actionedPetIds.map((l) => l.likedPetId);
  const excludeOwnerIds = new Set([userId, ...blocked.map((b) => b.blockedId), ...blockedBy.map((b) => b.blockerId)]);

  const pets = await prisma.pet.findMany({
    where: {
      isActive: true,
      ownerId: { notIn: Array.from(excludeOwnerIds) },
      id: { notIn: excludePetIds },
      owner: { city: me.city },
    },
    include: {
      photos: { orderBy: { order: 'asc' } },
      owner: { select: { id: true, name: true, city: true } },
    },
    take: 25,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ pets });
}
