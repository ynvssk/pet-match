import { AppShell } from '@/components/AppShell';
import { requireUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user.name || !user.city) redirect('/onboarding/profile');
  if (user.pets.length === 0) redirect('/onboarding/pet');

  return <AppShell>{children}</AppShell>;
}
