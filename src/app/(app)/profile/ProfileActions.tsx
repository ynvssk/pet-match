'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function ResetUserButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    if (!confirm('Reset your activity? This clears all your matches, chats, likes/passes, blocks, and reports. Your account and pets stay.')) return;
    setBusy(true);
    await fetch('/api/user/reset', { method: 'POST' });
    router.push('/discover');
    router.refresh();
  }
  return (
    <Button variant="outline" full onClick={onClick} loading={busy}>
      {busy ? 'Resetting…' : 'Reset activity (chats & swipes)'}
    </Button>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }
  return <Button variant="outline" full onClick={onClick} loading={busy}>Log out</Button>;
}

export function DeleteAccountButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    if (!confirm('Delete your account permanently? Pets, matches, and messages will be removed.')) return;
    setBusy(true);
    await fetch('/api/auth/delete', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }
  return <Button variant="danger" full onClick={onClick} loading={busy}>Delete account</Button>;
}
