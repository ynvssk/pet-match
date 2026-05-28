import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  await prisma.eventAttendee.upsert({
    where: { eventId_userId: { eventId: id, userId } },
    update: {},
    create: { eventId: id, userId },
  });
  return NextResponse.json({ ok: true, attending: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  await prisma.eventAttendee.deleteMany({ where: { eventId: id, userId } });
  return NextResponse.json({ ok: true, attending: false });
}
