import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { messageSchema } from '@/lib/validators';
import { pickAutoReply } from '@/lib/autoReply';

export async function GET(req: Request) {
  const userId = await requireUserId();
  const matchId = new URL(req.url).searchParams.get('matchId');
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  await prisma.message.updateMany({
    where: { matchId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: parsed.data.matchId } });
  if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;

  const userMsg = await prisma.message.create({
    data: {
      matchId: parsed.data.matchId,
      senderId: userId,
      text: parsed.data.text ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
    },
  });

  // Mocked auto-reply from the other user — MVP only. Replace with real-time chat post-MVP.
  const botMsg = await prisma.message.create({
    data: {
      matchId: parsed.data.matchId,
      senderId: otherUserId,
      text: pickAutoReply(parsed.data.text),
      isBot: true,
    },
  });

  return NextResponse.json({ userMessage: userMsg, autoReply: botMsg });
}
