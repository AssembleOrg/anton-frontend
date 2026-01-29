'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { FinanzasPanel } from './FinanzasPanel';

const easeOutLuxury: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FinanzasModalProps {
  open: boolean;
  onClose: () => void;
}

export function FinanzasModal({ open, onClose }: FinanzasModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.div
            key='overlay'
            className='fixed inset-0 z-40 bg-black/40 backdrop-blur-xl'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOutLuxury }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            key='modal'
            className='fixed inset-x-0 bottom-0 z-50 flex h-[90dvh] flex-col rounded-t-3xl border-t border-white/10 bg-black/60 backdrop-blur-3xl'
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: easeOutLuxury }}
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-white/10 px-6 py-5'>
              <h2 className='text-xs tracking-[0.38em] text-muted'>
                FINANZAS
              </h2>
              <button
                onClick={onClose}
                className='rounded-full p-2 text-muted transition-colors hover:bg-white/5 hover:text-foreground'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto px-6 py-6'>
              <FinanzasPanel />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
