'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

const FULL_SCREEN_ROUTES = ['/chat/', '/meetup/'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = FULL_SCREEN_ROUTES.some((p) => pathname.startsWith(p));

  return (
    <div className="flex min-h-dvh flex-col">
      <div className={cn('flex-1', !hideNav && 'pb-16')}>{children}</div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
