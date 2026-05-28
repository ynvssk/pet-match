import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { DiscoverClient } from './DiscoverClient';

export default async function DiscoverPage() {
  const user = await requireUser();

  const [actioned, blocked, blockedBy] = await Promise.all([
    prisma.like.findMany({ where: { likerId: user.id }, select: { likedPetId: true } }),
    prisma.block.findMany({ where: { blockerId: user.id }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: user.id }, select: { blockerId: true } }),
  ]);
  const excludePetIds = actioned.map((l) => l.likedPetId);
  const excludeOwnerIds = new Set([user.id, ...blocked.map((b) => b.blockedId), ...blockedBy.map((b) => b.blockerId)]);

  const pets = await prisma.pet.findMany({
    where: {
      isActive: true,
      ownerId: { notIn: Array.from(excludeOwnerIds) },
      id: { notIn: excludePetIds },
      owner: { city: user.city },
    },
    include: {
      photos: { orderBy: { order: 'asc' } },
      owner: { select: { id: true, name: true, city: true } },
    },
    take: 25,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="px-4 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Discover</h1>
        <span className="text-xs text-neutral-500">{user.city}</span>
      </header>
      <DiscoverClient initialPets={pets} />
    </main>
  );
}
