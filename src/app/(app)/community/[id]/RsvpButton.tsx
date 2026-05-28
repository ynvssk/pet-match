'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function RsvpButton({ eventId, initialAttending }: { eventId: string; initialAttending: boolean }) {
  const router = useRouter();
  const [attending, setAttending] = useState(initialAttending);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const method = attending ? 'DELETE' : 'POST';
    const res = await fetch(`/api/events/${eventId}/rsvp`, { method });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setAttending(data.attending);
    router.refresh();
  }

  return (
    <Button
      full
      variant={attending ? 'outline' : 'primary'}
      onClick={toggle}
      disabled={busy}
    >
      {busy ? (attending ? 'Removing…' : 'Confirming…') : attending ? "You're going — tap to opt out" : 'Opt in to this event'}
    </Button>
  );
}
