'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function PetDangerActions({ petId, isActive }: { petId: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    await fetch(`/api/pets/${petId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setBusy(false);
    router.refresh();
  }

  async function destroy() {
    if (!confirm('Permanently delete this pet profile? This cannot be undone.')) return;
    setBusy(true);
    await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
    setBusy(false);
    router.push('/profile');
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-neutral-700">Visibility</h2>
      <Button variant="outline" full onClick={toggleActive} loading={busy}>
        {isActive ? 'Deactivate (hide from Discover)' : 'Reactivate'}
      </Button>
      <Button variant="danger" full onClick={destroy} loading={busy}>
        Delete pet
      </Button>
    </div>
  );
}
