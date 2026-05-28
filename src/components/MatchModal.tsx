'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export type MatchData = {
  id: string;
  otherPet: { id: string; name: string; photo: string | null };
  myPet: { id: string; name: string; photo: string | null };
};

export function MatchModal({ match, onClose }: { match: MatchData; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">It&apos;s a match!</p>
        <h2 className="mt-1 text-2xl font-bold">{match.myPet.name} & {match.otherPet.name}</h2>
        <div className="my-6 flex items-center justify-center gap-4">
          {[match.myPet, match.otherPet].map((p, i) => (
            <div key={i} className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-brand-500">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-2xl">🐾</div>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-neutral-600">Say hi and plan a playdate!</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onClose}>Keep swiping</Button>
          <Button onClick={() => router.push(`/chat/${match.id}`)}>Send message</Button>
        </div>
      </div>
    </div>
  );
}
