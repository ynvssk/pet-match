'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

function VerifyInner() {
  const router = useRouter();
  const search = useSearchParams();
  const phone = search.get('phone') ?? '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? 'Invalid OTP');
      return;
    }
    // Keep `loading` true through navigation so the button stays disabled until the next page loads.
    if (data.needsProfile) router.push('/onboarding/profile');
    else if (data.needsPet) router.push('/onboarding/pet');
    else router.push('/discover');
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Enter the code</h1>
        <p className="mt-1 text-sm text-neutral-500">Sent to {phone || 'your phone'} (use <span className="font-mono">0000</span>).</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="otp">4-digit code</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="0000"
            className="text-center text-2xl tracking-widest"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" full loading={loading} disabled={otp.length !== 4}>
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
      </form>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
