import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { z } from 'zod';

const schema = z.object({ status: z.enum(['ACCEPTED', 'DECLINED', 'COUNTERED']) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const meetup = await prisma.meetup.findUnique({
    where: { id },
    include: { match: true },
  });
  if (!meetup) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const m = meetup.match;
  if (m.user1Id !== userId && m.user2Id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (meetup.proposedBy === userId) {
    return NextResponse.json({ error: "Can't respond to your own proposal" }, { status: 400 });
  }
  const updated = await prisma.meetup.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ meetup: updated });
}
