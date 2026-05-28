'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Users, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/discover', label: 'Discover', icon: Heart },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/matches', label: 'Matches', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur safe-bottom">
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-xs',
                  active ? 'text-brand-600' : 'text-neutral-500'
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
