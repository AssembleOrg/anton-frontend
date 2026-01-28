'use client';

import { PageTransition } from '../components/PageTransition';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
