import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

export async function GET() {
  const userId = await requireUserId();

  const blockedIds = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const hiddenUserIds = new Set<string>();
  for (const b of blockedIds) {
    if (b.blockerId !== userId) hiddenUserIds.add(b.blockerId);
    if (b.blockedId !== userId) hiddenUserIds.add(b.blockedId);
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      NOT: {
        OR: [
          { user1Id: { in: Array.from(hiddenUserIds) } },
          { user2Id: { in: Array.from(hiddenUserIds) } },
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const otherPetIds = matches.map((m) => (m.user1Id === userId ? m.pet2Id : m.pet1Id));
  const pets = await prisma.pet.findMany({
    where: { id: { in: otherPetIds } },
    include: { photos: { orderBy: { order: 'asc' }, take: 1 }, owner: { select: { id: true, name: true } } },
  });
  const petById = new Map(pets.map((p) => [p.id, p]));

  const lastMsgs = await prisma.message.findMany({
    where: { matchId: { in: matches.map((m) => m.id) } },
    orderBy: { createdAt: 'desc' },
    distinct: ['matchId'],
    take: matches.length,
  });
  const lastByMatch = new Map(lastMsgs.map((m) => [m.matchId, m]));

  const result = matches.map((m) => {
    const otherPetId = m.user1Id === userId ? m.pet2Id : m.pet1Id;
    const pet = petById.get(otherPetId);
    const last = lastByMatch.get(m.id);
    return {
      id: m.id,
      pet: pet
        ? { id: pet.id, name: pet.name, photo: pet.photos[0]?.url ?? null, ownerName: pet.owner.name }
        : null,
      lastMessage: last ? { text: last.text, createdAt: last.createdAt } : null,
      createdAt: m.createdAt,
    };
  });

  return NextResponse.json({ matches: result });
}
