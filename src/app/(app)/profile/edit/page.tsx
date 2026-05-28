import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { ProfileForm } from '@/app/onboarding/profile/ProfileForm';

export default async function EditProfilePage() {
  const user = await requireUser();
  return (
    <main className="px-4 pb-10 pt-2">
      <header className="-ml-1.5 mb-4 flex items-center gap-2">
        <Link href="/profile" aria-label="Back" className="p-1.5">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold">Edit profile</h1>
      </header>
      <ProfileForm
        initial={{
          name: user.name ?? '',
          bio: user.bio ?? '',
          city: (user.city as 'Bangalore' | 'Mumbai' | 'Delhi' | '') ?? '',
          photoUrl: user.photoUrl ?? '',
        }}
        nextHref="/profile"
      />
    </main>
  );
}
