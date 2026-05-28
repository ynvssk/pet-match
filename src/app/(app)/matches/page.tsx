import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

export default async function MatchesPage() {
  const user = await requireUser();

  const blockedIds = await prisma.block.findMany({
    where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] },
    select: { blockerId: true, blockedId: true },
  });
  const hiddenUserIds = new Set<string>();
  for (const b of blockedIds) {
    if (b.blockerId !== user.id) hiddenUserIds.add(b.blockerId);
    if (b.blockedId !== user.id) hiddenUserIds.add(b.blockedId);
  }
  const hiddenArr = Array.from(hiddenUserIds);

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
      ...(hiddenArr.length > 0 && {
        NOT: { OR: [{ user1Id: { in: hiddenArr } }, { user2Id: { in: hiddenArr } }] },
      }),
    },
    orderBy: { createdAt: 'desc' },
  });

  const otherPetIds = matches.map((m) => (m.user1Id === user.id ? m.pet2Id : m.pet1Id));
  const pets = await prisma.pet.findMany({
    where: { id: { in: otherPetIds } },
    include: { photos: { orderBy: { order: 'asc' }, take: 1 }, owner: { select: { name: true } } },
  });
  const petById = new Map(pets.map((p) => [p.id, p]));

  const lastMsgs = matches.length
    ? await prisma.message.findMany({
        where: { matchId: { in: matches.map((m) => m.id) } },
        orderBy: { createdAt: 'desc' },
        distinct: ['matchId'],
      })
    : [];
  const lastByMatch = new Map(lastMsgs.map((m) => [m.matchId, m]));

  return (
    <main className="px-4 pt-6">
      <h1 className="mb-4 text-xl font-bold">Matches</h1>
      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-4xl">💌</p>
          <h2 className="mt-3 text-lg font-semibold">No matches yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Keep swiping in Discover!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {matches.map((m) => {
            const otherPet = petById.get(m.user1Id === user.id ? m.pet2Id : m.pet1Id);
            const last = lastByMatch.get(m.id);
            return (
              <li key={m.id}>
                <Link
                  href={`/chat/${m.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-100 active:bg-neutral-50"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-neutral-100">
                    {otherPet?.photos[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={otherPet.photos[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🐾</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{otherPet?.name ?? 'Unknown'}</p>
                      <span className="text-xs text-neutral-400">{otherPet?.owner.name ?? ''}</span>
                    </div>
                    <p className="truncate text-sm text-neutral-500">
                      {last?.text ?? 'Say hi!'}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
