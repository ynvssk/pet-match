import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { z } from 'zod';

const schema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().trim().min(3).max(300),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  await prisma.report.create({
    data: { reporterId: userId, targetUserId: parsed.data.targetUserId, reason: parsed.data.reason },
  });
  return NextResponse.json({ ok: true });
}
