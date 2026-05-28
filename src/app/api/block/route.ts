import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { z } from 'zod';

const schema = z.object({ userId: z.string().min(1) });

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  if (parsed.data.userId === userId) {
    return NextResponse.json({ error: "Can't block yourself" }, { status: 400 });
  }
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: userId, blockedId: parsed.data.userId } },
    update: {},
    create: { blockerId: userId, blockedId: parsed.data.userId },
  });
  return NextResponse.json({ ok: true });
}
