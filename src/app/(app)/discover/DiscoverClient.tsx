'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MatchModal, type MatchData } from '@/components/MatchModal';

type Pet = {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  gender: string;
  bio: string | null;
  temperament: string[];
  photos: { url: string }[];
  owner: { name: string | null; city: string | null };
};

export function DiscoverClient({ initialPets }: { initialPets: Pet[] }) {
  const router = useRouter();
  const [pets, setPets] = useState(initialPets);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [busy, setBusy] = useState(false);

  const current = pets[0];

  async function act(action: 'LIKE' | 'PASS') {
    if (!current || busy) return;
    setBusy(true);
    const petId = current.id;
    setPets((prev) => prev.slice(1));
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId, action }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    if (data.match) setMatch(data.match);
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-4xl">🐾</p>
        <h2 className="mt-3 text-lg font-semibold">No more pets nearby</h2>
        <p className="mt-1 text-sm text-neutral-500">Check back soon — more pups join every day.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.refresh()}>Refresh</Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.photos[0]?.url ?? ''}
          alt={current.name}
          className="aspect-[3/4] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <div className="flex items-end gap-2">
            <h2 className="text-2xl font-bold">{current.name}</h2>
            <span className="text-lg opacity-90">{current.age}</span>
          </div>
          <p className="text-sm opacity-90">{current.breed} • {current.size.toLowerCase()} • {current.owner.city}</p>
          {current.bio && <p className="mt-1 text-sm opacity-90 line-clamp-2">{current.bio}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {current.temperament.map((t) => (
              <span key={t} className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <button
          onClick={() => act('PASS')}
          disabled={busy}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-500 shadow-sm active:scale-95"
          aria-label="Pass"
        >
          <X size={28} />
        </button>
        <button
          onClick={() => act('LIKE')}
          disabled={busy}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-sm active:scale-95"
          aria-label="Like"
        >
          <Heart size={28} fill="currentColor" />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-neutral-400">
        {pets.length} {pets.length === 1 ? 'pet' : 'pets'} to see
      </p>

      {match && <MatchModal match={match} onClose={() => setMatch(null)} />}
    </>
  );
}
