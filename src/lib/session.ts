import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySession } from './auth';
import { prisma } from './db';

export async function getCurrentUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    include: { pets: { include: { photos: { orderBy: { order: 'asc' } } } } },
  });
}

export async function requireUser() {
  const id = await getCurrentUserId();
  if (!id) redirect('/login');
  const user = await prisma.user.findUnique({
    where: { id },
    include: { pets: { include: { photos: { orderBy: { order: 'asc' } } } } },
  });
  // JWT was valid but the user no longer exists (e.g. wiped by db:seed). Clear the cookie.
  if (!user) redirect('/api/auth/logout');
  return user;
}

export async function requireUserId(): Promise<string> {
  const id = await getCurrentUserId();
  if (!id) redirect('/login');
  return id;
}
