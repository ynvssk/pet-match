'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+91 ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to send OTP');
      return;
    }
    // Keep `loading` true through navigation so the button stays disabled until /verify loads.
    router.push(`/verify?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-3xl">🐾</div>
        <h1 className="text-2xl font-bold">Welcome to PetMatch</h1>
        <p className="mt-1 text-sm text-neutral-500">Find pet friends nearby.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" full loading={loading}>
          {loading ? 'Sending…' : 'Send OTP'}
        </Button>
        <p className="text-center text-xs text-neutral-400">MVP: any phone works, OTP is always <span className="font-mono">0000</span>.</p>
      </form>
    </main>
  );
}
