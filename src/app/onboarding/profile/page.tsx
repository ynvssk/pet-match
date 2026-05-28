import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { ProfileForm } from './ProfileForm';

export default async function OnboardingProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-10">
      <h1 className="text-2xl font-bold">About you</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">A little about you (the human).</p>
      <ProfileForm
        initial={{
          name: user.name ?? '',
          bio: user.bio ?? '',
          city: (user.city as 'Bangalore' | 'Mumbai' | 'Delhi' | '') ?? '',
          photoUrl: user.photoUrl ?? '',
        }}
        nextHref={user.pets.length === 0 ? '/onboarding/pet' : '/discover'}
      />
    </main>
  );
}
