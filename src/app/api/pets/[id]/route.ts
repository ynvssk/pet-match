import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';
import { petSchema } from '@/lib/validators';
import { z } from 'zod';

const patchSchema = petSchema.partial().extend({
  isActive: z.boolean().optional(),
});

async function assertOwner(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { ownerId: true } });
  if (!pet) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  if (pet.ownerId !== userId) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { error: null };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const { error } = await assertOwner(id, userId);
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { photoUrls, ...data } = parsed.data;

  const pet = await prisma.$transaction(async (tx) => {
    if (photoUrls) {
      await tx.petPhoto.deleteMany({ where: { petId: id } });
      await tx.petPhoto.createMany({
        data: photoUrls.map((url, order) => ({ petId: id, url, order })),
      });
    }
    return tx.pet.update({
      where: { id },
      data,
      include: { photos: { orderBy: { order: 'asc' } } },
    });
  });

  return NextResponse.json({ pet });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const { error } = await assertOwner(id, userId);
  if (error) return error;
  await prisma.pet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
