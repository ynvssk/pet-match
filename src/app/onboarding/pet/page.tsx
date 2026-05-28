import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { PetForm } from '@/components/PetForm';

export default async function OnboardingPetPage() {
  const user = await requireUser();
  if (!user.name || !user.city) redirect('/onboarding/profile');

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-10">
      <h1 className="text-2xl font-bold">Add your pet</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">Tell us about your best friend.</p>
      <PetForm mode="create" />
    </main>
  );
}
