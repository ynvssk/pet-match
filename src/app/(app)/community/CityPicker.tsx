'use client';

import { useRouter } from 'next/navigation';
import { CITIES } from '@/lib/validators';

export function CityPicker({ current }: { current: string }) {
  const router = useRouter();
  return (
    <select
      value={current}
      onChange={(e) => router.push(`/community?city=${encodeURIComponent(e.target.value)}`)}
      className="h-9 rounded-full border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      {CITIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
