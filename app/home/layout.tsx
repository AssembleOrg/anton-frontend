'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '../features/auth/store';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAppStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  // Don't render anything while checking auth
  if (!token) return null;

  return <>{children}</>;
}
