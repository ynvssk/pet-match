'use client';

import * as React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function PhotoUploader({ value, onChange, max = 6 }: PhotoUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (value.length + newUrls.length >= max) break;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('Only JPG, PNG, or WebP allowed');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Each file must be under 5 MB');
          continue;
        }
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: form });
        if (!res.ok) {
          setError('Upload failed');
          continue;
        }
        const data = await res.json();
        newUrls.push(data.url);
      }
      onChange([...value, ...newUrls].slice(0, max));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {value.map((url, idx) => (
          <div key={url} className={cn('relative aspect-square overflow-hidden rounded-xl bg-neutral-100', idx === 0 && 'ring-2 ring-brand-500')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            {idx === 0 && <span className="absolute left-1 top-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Cover</span>}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              aria-label="Remove"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 left-1 flex gap-1">
              {idx > 0 && (
                <button type="button" onClick={() => move(idx, idx - 1)} className="rounded bg-black/60 px-1.5 text-[10px] text-white">←</button>
              )}
              {idx < value.length - 1 && (
                <button type="button" onClick={() => move(idx, idx + 1)} className="rounded bg-black/60 px-1.5 text-[10px] text-white">→</button>
              )}
            </div>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-brand-500 hover:text-brand-500"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Plus />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-neutral-500">First photo is the cover. Up to {max} photos, 5 MB each.</p>
    </div>
  );
}
