import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { MeetupClient } from './MeetupClient';

export default async function MeetupPage({ params }: { params: Promise<{ matchId: string }> }) {
  const user = await requireUser();
  const { matchId } = await params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) notFound();

  const [venues, meetups] = await Promise.all([
    prisma.venue.findMany({ where: { city: user.city ?? '' }, orderBy: { name: 'asc' } }),
    prisma.meetup.findMany({ where: { matchId }, orderBy: { createdAt: 'desc' } }),
  ]);

  const venueById = new Map(venues.map((v) => [v.id, v]));

  return (
    <main className="px-4 pb-6 pt-2">
      <header className="mb-4 -ml-1.5 flex items-center gap-2">
        <Link href={`/chat/${matchId}`} aria-label="Back" className="p-1.5">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold">Plan a meetup</h1>
      </header>

      <MeetupClient
        matchId={matchId}
        currentUserId={user.id}
        venues={venues.map((v) => ({ id: v.id, name: v.name, address: v.address, category: v.category }))}
        initialMeetups={meetups.map((m) => ({
          id: m.id,
          venueId: m.venueId,
          venueName: m.venueId ? venueById.get(m.venueId)?.name ?? null : null,
          note: m.note,
          status: m.status,
          proposedBy: m.proposedBy,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
