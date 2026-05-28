import * as React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ selected, className, children, ...props }) => (
  <button
    type="button"
    className={cn(
      'rounded-full border px-3 py-1.5 text-sm transition',
      selected
        ? 'border-brand-500 bg-brand-50 text-brand-700'
        : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
