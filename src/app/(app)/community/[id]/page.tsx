import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { formatEventDate } from '@/lib/utils';
import { RsvpButton } from './RsvpButton';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      attendees: { select: { userId: true } },
    },
  });
  if (!event) notFound();

  const attending = event.attendees.some((a) => a.userId === user.id);
  const totalAttending = event.attendees.length;

  // Find current user's matches and intersect with this event's attendees.
  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
    select: { user1Id: true, user2Id: true, pet1Id: true, pet2Id: true },
  });
  const matchedUserToPet = new Map<string, string>();
  for (const m of matches) {
    if (m.user1Id === user.id) matchedUserToPet.set(m.user2Id, m.pet2Id);
    else matchedUserToPet.set(m.user1Id, m.pet1Id);
  }

  const attendeeUserIds = event.attendees.map((a) => a.userId);
  const matchedAttendingUserIds = attendeeUserIds.filter((uid) => matchedUserToPet.has(uid));
  const matchedPetIds = matchedAttendingUserIds.map((uid) => matchedUserToPet.get(uid)!).filter(Boolean);

  const matchedPets = matchedPetIds.length
    ? await prisma.pet.findMany({
        where: { id: { in: matchedPetIds } },
        select: {
          id: true,
          name: true,
          ownerId: true,
          photos: { orderBy: { order: 'asc' }, take: 1 },
        },
      })
    : [];

  return (
    <main className="px-4 pb-10 pt-2">
      <header className="-ml-1.5 mb-3 flex items-center gap-2">
        <Link href="/community" aria-label="Back" className="p-1.5">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="truncate text-xl font-bold">{event.name}</h1>
      </header>

      <section className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-neutral-100">
        <p className="flex items-center gap-2 text-sm">
          <Calendar size={15} className="text-neutral-500" />
          <span>
            {formatEventDate(event.startsAt)}
            {event.startsAt && event.details && <span className="text-neutral-400"> · </span>}
            {event.details}
          </span>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <MapPin size={15} className="text-neutral-500" />
          <span>{event.location}</span>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Users size={15} className="text-neutral-500" />
          <span>{totalAttending} attending • {event.city}</span>
        </p>
      </section>

      {matchedPets.length > 0 && (
        <section className="mt-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
          <h2 className="text-sm font-semibold text-brand-700">
            {matchedPets.length === 1 ? 'A match of yours is coming!' : 'Matches of yours are coming!'}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-3">
            {matchedPets.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-white ring-2 ring-brand-500">
                  {p.photos[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photos[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">🐾</div>
                  )}
                </div>
                <span className="text-sm font-medium text-brand-800">{p.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4">
        <h2 className="mb-1.5 text-sm font-semibold text-neutral-700">About</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{event.description}</p>
      </section>

      <div className="mt-6">
        <RsvpButton eventId={event.id} initialAttending={attending} />
      </div>
    </main>
  );
}
