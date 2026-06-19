'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const userStorageKey = 'report-workflow-user';

const publicPaths = ['/login'];
const protectedPaths = ['/assistant', '/view', '/fill', '/navigate', '/user-management'];

function hasSession() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(userStorageKey));
}

export function RequireLogin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasSession()) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}

export function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasSession()) {
      router.replace('/assistant');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}

export function LockToAssistant() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (publicPaths.includes(pathname)) return;

    if (pathname === '/' || pathname === '/dashboard') {
      router.replace(hasSession() ? '/assistant' : '/login');
      return;
    }

    if (protectedPaths.includes(pathname) && !hasSession()) {
      router.replace('/login');
    }
  }, [pathname, router]);

  return null;
}
