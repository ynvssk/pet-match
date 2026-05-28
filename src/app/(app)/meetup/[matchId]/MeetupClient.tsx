'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea, Label } from '@/components/ui/Input';

type Venue = { id: string; name: string; address: string; category: string };
type Meetup = {
  id: string;
  venueId: string | null;
  venueName: string | null;
  note: string | null;
  status: string;
  proposedBy: string;
  createdAt: string;
};

interface MeetupClientProps {
  matchId: string;
  currentUserId: string;
  venues: Venue[];
  initialMeetups: Meetup[];
}

export function MeetupClient({ matchId, currentUserId, venues, initialMeetups }: MeetupClientProps) {
  const router = useRouter();
  const [meetups, setMeetups] = useState(initialMeetups);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    if (!venueId || busy) return;
    setBusy(true);
    const res = await fetch('/api/meetup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, venueId, note: note || null }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    const venue = venues.find((v) => v.id === venueId);
    setMeetups((prev) => [
      {
        id: data.meetup.id,
        venueId,
        venueName: venue?.name ?? null,
        note: note || null,
        status: 'PROPOSED',
        proposedBy: currentUserId,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setVenueId(null);
    setNote('');
    router.refresh();
  }

  async function respond(meetupId: string, status: 'ACCEPTED' | 'DECLINED' | 'COUNTERED') {
    setResponding(`${meetupId}:${status}`);
    const res = await fetch(`/api/meetup/${meetupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setResponding(null);
    if (!res.ok) return;
    setMeetups((prev) => prev.map((m) => (m.id === meetupId ? { ...m, status } : m)));
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Pick a spot</h2>
        {venues.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
            No venues seeded for your city yet.
          </p>
        ) : (
          <form onSubmit={propose} className="space-y-3">
            <ul className="space-y-2">
              {venues.map((v) => (
                <li key={v.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                    <input
                      type="radio"
                      name="venue"
                      value={v.id}
                      checked={venueId === v.id}
                      onChange={() => setVenueId(v.id)}
                      className="h-4 w-4 accent-brand-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-neutral-500">{v.address} • {v.category}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                rows={2}
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How about Saturday morning?"
              />
            </div>
            <Button type="submit" full loading={busy} disabled={!venueId}>
              {busy ? 'Sending…' : 'Suggest meetup'}
            </Button>
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Activity</h2>
        {meetups.length === 0 ? (
          <p className="text-sm text-neutral-500">No proposals yet.</p>
        ) : (
          <ul className="space-y-2">
            {meetups.map((m) => {
              const mine = m.proposedBy === currentUserId;
              return (
                <li key={m.id} className="rounded-xl bg-white p-3 ring-1 ring-neutral-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{m.venueName ?? 'A spot'}</p>
                      {m.note && <p className="mt-0.5 text-sm text-neutral-600">{m.note}</p>}
                      <p className="mt-1 text-xs text-neutral-400">
                        {mine ? 'You proposed' : 'They proposed'} • {m.status.toLowerCase()}
                      </p>
                    </div>
                    {!mine && m.status === 'PROPOSED' && (
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => respond(m.id, 'ACCEPTED')} loading={responding === `${m.id}:ACCEPTED`} disabled={responding !== null}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => respond(m.id, 'DECLINED')} loading={responding === `${m.id}:DECLINED`} disabled={responding !== null}>Decline</Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
