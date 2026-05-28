'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CITIES } from '@/lib/validators';

interface ProfileFormProps {
  initial: { name: string; bio: string; city: string; photoUrl: string };
  nextHref: string;
}

export function ProfileForm({ initial, nextHref }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, photoUrl: photoUrl || null }),
    });
    if (!res.ok) {
      setSaving(false);
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Could not save');
      return;
    }
    // Keep `saving` true through navigation so the button stays disabled until the next page loads.
    router.push(nextHref);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-neutral-200">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">🙂</div>
          )}
        </div>
        <label className="cursor-pointer rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium">
          {uploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Add photo'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
          />
        </label>
      </div>

      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} />
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Select id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required>
          <option value="" disabled>Select your city</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div>
        <Label htmlFor="bio">Short bio (optional)</Label>
        <Textarea
          id="bio"
          rows={3}
          maxLength={280}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="A few words about you and your pet…"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" full loading={saving} disabled={uploading}>
        {saving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
