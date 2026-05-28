import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { ChatClient } from './ChatClient';
import { ChatHeaderMenu } from './ChatHeaderMenu';

export default async function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const user = await requireUser();
  const { matchId } = await params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.user1Id !== user.id && match.user2Id !== user.id)) notFound();

  const otherPetId = match.user1Id === user.id ? match.pet2Id : match.pet1Id;
  const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
  const otherPet = await prisma.pet.findUnique({
    where: { id: otherPetId },
    include: { photos: { orderBy: { order: 'asc' }, take: 1 }, owner: { select: { id: true, name: true } } },
  });
  if (!otherPet) notFound();

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  return (
    <div className="flex h-dvh flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white px-3 py-2.5">
        <Link href="/matches" aria-label="Back" className="p-1.5">
          <ArrowLeft size={22} />
        </Link>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100">
          {otherPet.photos[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherPet.photos[0].url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">🐾</div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold leading-tight">{otherPet.name}</p>
          <p className="text-xs text-neutral-500">with {otherPet.owner.name}</p>
        </div>
        <Link
          href={`/meetup/${matchId}`}
          className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
        >
          <MapPin size={14} className="-mt-0.5 mr-1 inline" />
          Meetup
        </Link>
        <ChatHeaderMenu targetUserId={otherUserId} />
      </header>

      <ChatClient
        matchId={matchId}
        currentUserId={user.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          text: m.text,
          imageUrl: m.imageUrl,
          senderId: m.senderId,
          createdAt: m.createdAt.toISOString(),
          isBot: m.isBot,
        }))}
      />
    </div>
  );
}
