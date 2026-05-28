import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { CITIES } from '@/lib/validators';
import { formatEventDate } from '@/lib/utils';
import { CityPicker } from './CityPicker';

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const user = await requireUser();
  const { city: cityParam } = await searchParams;
  const city = (CITIES as readonly string[]).includes(cityParam ?? '')
    ? (cityParam as string)
    : (user.city ?? CITIES[0]);

  // Map of (other userId) -> (their pet id) for this user's matches.
  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
    select: { user1Id: true, user2Id: true, pet1Id: true, pet2Id: true },
  });
  const matchedUserToPet = new Map<string, string>();
  for (const m of matches) {
    if (m.user1Id === user.id) matchedUserToPet.set(m.user2Id, m.pet2Id);
    else matchedUserToPet.set(m.user1Id, m.pet1Id);
  }

  const events = await prisma.event.findMany({
    where: { city },
    orderBy: [{ startsAt: 'asc' }, { createdAt: 'asc' }],
    include: {
      _count: { select: { attendees: true } },
      attendees: { select: { userId: true } },
    },
  });

  // Compute matched pets attending each event (in one batched pet query).
  const allMatchedPetIds = new Set<string>();
  const perEvent = events.map((ev) => {
    const attendeeIds = ev.attendees.map((a) => a.userId);
    const going = attendeeIds.includes(user.id);
    const matchedPetIds = attendeeIds
      .filter((id) => matchedUserToPet.has(id))
      .map((id) => matchedUserToPet.get(id)!);
    matchedPetIds.forEach((id) => allMatchedPetIds.add(id));
    return { ev, going, matchedPetIds };
  });

  const pets = allMatchedPetIds.size
    ? await prisma.pet.findMany({
        where: { id: { in: Array.from(allMatchedPetIds) } },
        select: { id: true, name: true, photos: { orderBy: { order: 'asc' }, take: 1 } },
      })
    : [];
  const petById = new Map(pets.map((p) => [p.id, p]));

  return (
    <main className="px-4 pt-6">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Community</h1>
        <CityPicker current={city} />
      </header>
      <p className="mb-4 text-sm text-neutral-500">Events near pet parents in {city}.</p>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-4xl">📅</p>
          <h2 className="mt-3 text-lg font-semibold">No events yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Check back soon, or pick another city above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {perEvent.map(({ ev, going, matchedPetIds }) => {
            const matchedPets = matchedPetIds
              .map((id) => petById.get(id))
              .filter((p): p is NonNullable<typeof p> => Boolean(p));
            return (
              <li key={ev.id}>
                <Link
                  href={`/community/${ev.id}`}
                  className="block rounded-2xl bg-white p-4 ring-1 ring-neutral-100 active:bg-neutral-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold">{ev.name}</h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                        <Calendar size={13} />
                        {formatEventDate(ev.startsAt)}
                        {ev.details && <span className="text-neutral-400">·</span>}
                        {ev.details}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-neutral-500">
                        <MapPin size={13} /> {ev.location}
                      </p>
                    </div>
                    {going && (
                      <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Going
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Users size={13} /> {ev._count.attendees} attending
                    </span>
                    {matchedPets.length > 0 && (
                      <span className="flex items-center gap-2">
                        <span className="flex -space-x-2">
                          {matchedPets.slice(0, 4).map((p) => (
                            <span
                              key={p.id}
                              className="h-7 w-7 overflow-hidden rounded-full bg-neutral-100 ring-2 ring-white"
                              title={p.name}
                            >
                              {p.photos[0]?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.photos[0].url} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs">🐾</span>
                              )}
                            </span>
                          ))}
                        </span>
                        <span className="text-[11px] font-medium text-brand-700">
                          {matchedPets.length === 1 ? `${matchedPets[0].name} is going` : `${matchedPets.length} matches going`}
                          {matchedPets.length > 4 ? ` +${matchedPets.length - 4}` : ''}
                        </span>
                      </span>
                    )}
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
