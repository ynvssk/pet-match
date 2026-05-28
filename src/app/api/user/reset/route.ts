import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

// Wipes the current user's chat / match / like / block / report state.
// Keeps the user account, profile, and pets so they can re-test the flow.
export async function POST() {
  const userId = await requireUserId();

  await prisma.$transaction([
    prisma.match.deleteMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    }),
    prisma.like.deleteMany({ where: { likerId: userId } }),
    prisma.like.deleteMany({ where: { likedPet: { ownerId: userId } } }),
    prisma.block.deleteMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    }),
    prisma.report.deleteMany({ where: { reporterId: userId } }),
    prisma.eventAttendee.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
