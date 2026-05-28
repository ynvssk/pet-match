import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/session';

export default async function Home() {
  const id = await getCurrentUserId();
  redirect(id ? '/discover' : '/login');
}
