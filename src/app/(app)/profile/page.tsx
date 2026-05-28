import Link from 'next/link';
import { Settings } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { Button } from '@/components/ui/Button';
import { LogoutButton, DeleteAccountButton, ResetUserButton } from './ProfileActions';

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <main className="px-4 pb-6 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        <Link href="/profile/edit" aria-label="Edit profile" className="rounded-full p-1.5 text-neutral-600">
          <Settings size={20} />
        </Link>
      </header>

      <section className="mb-6 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-neutral-100">
          {user.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">🙂</div>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-neutral-500">{user.city}</p>
          {user.bio && <p className="mt-1 text-sm">{user.bio}</p>}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Your pets</h2>
        {user.pets.length === 0 ? (
          <Link href="/pet/new" className="block rounded-xl border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500">
            Add your first pet
          </Link>
        ) : (
          <ul className="space-y-2">
            {user.pets.map((pet) => (
              <li key={pet.id}>
                <Link
                  href={`/pet/${pet.id}/edit`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-neutral-100"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-neutral-100">
                    {pet.photos[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pet.photos[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🐾</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{pet.name}</p>
                    <p className="text-xs text-neutral-500">{pet.breed} • {pet.age}y</p>
                  </div>
                  {!pet.isActive && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">Inactive</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Link href="/profile/edit">
            <Button variant="outline" full>Edit your profile</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-2 pt-4">
        <ResetUserButton />
        <LogoutButton />
        <DeleteAccountButton />
      </section>
    </main>
  );
}
