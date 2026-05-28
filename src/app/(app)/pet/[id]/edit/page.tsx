import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { PetForm } from '@/components/PetForm';
import { PetDangerActions } from './PetDangerActions';

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  });
  if (!pet || pet.ownerId !== user.id) notFound();

  return (
    <main className="px-4 pb-10 pt-2">
      <header className="-ml-1.5 mb-4 flex items-center gap-2">
        <Link href="/profile" aria-label="Back" className="p-1.5">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold">Edit {pet.name}</h1>
      </header>
      <PetForm
        mode="edit"
        petId={pet.id}
        initial={{
          name: pet.name,
          breed: pet.breed,
          age: String(pet.age),
          gender: pet.gender,
          size: pet.size,
          temperament: pet.temperament,
          activities: pet.activities,
          bio: pet.bio ?? '',
          vaccinated: pet.vaccinated,
          photoUrls: pet.photos.map((p) => p.url),
        }}
      />
      <div className="mt-8 border-t border-neutral-200 pt-6">
        <PetDangerActions petId={pet.id} isActive={pet.isActive} />
      </div>
    </main>
  );
}
