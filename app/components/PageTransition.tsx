'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { easings, durations } from '../lib/motion';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          opacity: { duration: durations.normal, ease: easings.luxury },
          y: { duration: durations.slow, ease: easings.entrance },
          scale: { duration: durations.fast, ease: easings.exit },
        }}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
