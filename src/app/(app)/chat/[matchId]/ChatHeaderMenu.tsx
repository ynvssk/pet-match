'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';

export function ChatHeaderMenu({ targetUserId }: { targetUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function block() {
    if (!confirm('Block this user? They will no longer see you or your pet, and your match will be removed from view.')) {
      setOpen(false);
      return;
    }
    setBusy(true);
    await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId }),
    });
    setBusy(false);
    router.push('/matches');
    router.refresh();
  }

  async function report() {
    const reason = prompt('What\'s the reason for reporting?');
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, reason: reason.trim() }),
    });
    setBusy(false);
    setOpen(false);
    alert('Thanks — we\'ll review the report.');
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="p-1.5" aria-label="More">
        <MoreVertical size={20} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1 w-40 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-neutral-200">
            <button
              onClick={report}
              disabled={busy}
              className="block w-full px-3 py-2.5 text-left text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Report'}
            </button>
            <button
              onClick={block}
              disabled={busy}
              className="block w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Block'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
