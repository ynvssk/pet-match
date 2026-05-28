import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

export async function GET(req: Request) {
  await requireUserId();
  const city = new URL(req.url).searchParams.get('city');
  if (!city) return NextResponse.json({ venues: [] });
  const venues = await prisma.venue.findMany({ where: { city }, orderBy: { name: 'asc' } });
  return NextResponse.json({ venues });
}
