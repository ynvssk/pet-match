'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Chip } from '@/components/ui/Chip';
import { PhotoUploader } from '@/components/PhotoUploader';
import { TEMPERAMENTS, ACTIVITIES } from '@/lib/validators';

type PetFormValues = {
  name: string;
  breed: string;
  age: string;
  gender: 'MALE' | 'FEMALE' | '';
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | '';
  temperament: string[];
  activities: string[];
  bio: string;
  vaccinated: boolean;
  photoUrls: string[];
};

interface PetFormProps {
  mode: 'create' | 'edit';
  petId?: string;
  initial?: Partial<PetFormValues>;
}

const EMPTY: PetFormValues = {
  name: '',
  breed: '',
  age: '',
  gender: '',
  size: '',
  temperament: [],
  activities: [],
  bio: '',
  vaccinated: false,
  photoUrls: [],
};

export function PetForm({ mode, petId, initial }: PetFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PetFormValues>({ ...EMPTY, ...initial });
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: 'temperament' | 'activities', value: string) {
    setForm((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  }

  function validateLocal(): string | null {
    if (!form.name.trim()) return 'Name is required';
    if (!form.breed.trim()) return 'Breed is required';
    if (!form.age || isNaN(Number(form.age))) return 'Age is required';
    if (!form.gender) return 'Pick a gender';
    if (!form.size) return 'Pick a size';
    if (form.temperament.length === 0) return 'Pick at least one trait';
    if (form.photoUrls.length === 0) return 'Add at least one photo';
    return null;
  }

  function goPreview(e: React.FormEvent) {
    e.preventDefault();
    const err = validateLocal();
    if (err) return setError(err);
    setError(null);
    setStep('preview');
    window.scrollTo({ top: 0 });
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      species: 'DOG',
      breed: form.breed.trim(),
      age: Number(form.age),
      gender: form.gender,
      size: form.size,
      temperament: form.temperament,
      activities: form.activities,
      bio: form.bio.trim() || null,
      vaccinated: form.vaccinated,
      photoUrls: form.photoUrls,
    };
    const url = mode === 'create' ? '/api/pets' : `/api/pets/${petId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Save failed');
      setStep('form');
      return;
    }
    router.push(mode === 'create' ? '/discover' : '/profile');
    router.refresh();
  }

  if (step === 'preview') {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.photoUrls[0]} alt="" className="aspect-[3/4] w-full object-cover" />
          <div className="space-y-2 p-4">
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-bold">{form.name}</h2>
              <span className="text-neutral-500">{form.age}</span>
            </div>
            <p className="text-sm text-neutral-600">{form.breed} • {form.size.toLowerCase()} • {form.gender.toLowerCase()}</p>
            {form.bio && <p className="text-sm">{form.bio}</p>}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {form.temperament.map((t) => (
                <span key={t} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">{t}</span>
              ))}
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="button" variant="outline" full onClick={() => setStep('form')}>Edit</Button>
          <Button type="button" full onClick={save} disabled={saving}>
            {saving ? 'Saving…' : mode === 'create' ? 'Publish' : 'Save changes'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={goPreview} className="space-y-4">
      <div>
        <Label>Photos</Label>
        <PhotoUploader value={form.photoUrls} onChange={(photoUrls) => setForm({ ...form, photoUrls })} />
      </div>

      <div>
        <Label htmlFor="pname">Name</Label>
        <Input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>

      <div>
        <Label htmlFor="breed">Breed</Label>
        <Input id="breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} required placeholder="e.g. Golden Retriever" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="age">Age (yrs)</Label>
          <Input id="age" type="number" min={0} max={30} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' })} required>
            <option value="" disabled>—</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="size">Size</Label>
          <Select id="size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value as 'SMALL' | 'MEDIUM' | 'LARGE' })} required>
            <option value="" disabled>—</option>
            <option value="SMALL">Small</option>
            <option value="MEDIUM">Medium</option>
            <option value="LARGE">Large</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Temperament (1–5)</Label>
        <div className="flex flex-wrap gap-2">
          {TEMPERAMENTS.map((t) => (
            <Chip key={t} selected={form.temperament.includes(t)} onClick={() => toggle('temperament', t)}>{t}</Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>Favorite activities (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => (
            <Chip key={a} selected={form.activities.includes(a)} onClick={() => toggle('activities', a)}>{a}</Chip>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="pbio">Bio (optional)</Label>
        <Textarea id="pbio" rows={3} maxLength={280} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A few words about your pet…" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.vaccinated} onChange={(e) => setForm({ ...form, vaccinated: e.target.checked })} />
        Up-to-date on vaccinations
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" full>Preview</Button>
    </form>
  );
}
