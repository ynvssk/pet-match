import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { meetupSchema } from '@/lib/validators';

export async function GET(req: Request) {
  const userId = await requireUserId();
  const matchId = new URL(req.url).searchParams.get('matchId');
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const meetups = await prisma.meetup.findMany({
    where: { matchId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ meetups });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = meetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: parsed.data.matchId } });
  if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const meetup = await prisma.meetup.create({
    data: {
      matchId: parsed.data.matchId,
      proposedBy: userId,
      venueId: parsed.data.venueId ?? null,
      note: parsed.data.note ?? null,
    },
  });
  return NextResponse.json({ meetup });
}
