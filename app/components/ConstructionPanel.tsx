'use client';

import { useAppStore } from '../features/auth/store';
import { motion } from 'framer-motion';

const easeOutLuxury: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ConstructionPanel() {
  const activeConsorcioName = useAppStore((state) => state.activeConsorcioName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutLuxury }}
      className='relative h-full w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0F] p-12'
    >
      {/* Blueprint grid pattern */}
      <div
        className='absolute inset-0 opacity-[0.15]'
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(145, 160, 135, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(145, 160, 135, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Crosshair overlay (architectural precision) */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div className='relative h-32 w-32'>
          <div className='absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-brand-moss/20' />
          <div className='absolute left-0 top-1/2 h-[1px] w-full -translate-y-1/2 bg-brand-moss/20' />
          <div className='absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-moss/30' />
        </div>
      </div>

      {/* Content */}
      <div className='relative z-10 flex h-full flex-col items-center justify-center space-y-6 text-center'>
        <div className='space-y-3'>
          <div className='font-mono text-[10px] tracking-[0.3em] text-brand-moss/60'>
            MÓDULO EN DESARROLLO
          </div>
          <div className='font-mono text-2xl font-light tracking-[0.15em] text-foreground/80'>
            PROYECTO {activeConsorcioName || 'ANTON ARTS'}
          </div>
        </div>

        {/* Architectural detail lines */}
        <div className='flex items-center gap-4'>
          <div className='h-[1px] w-16 bg-brand-moss/30' />
          <div className='h-1 w-1 rounded-full bg-brand-moss/40' />
          <div className='h-[1px] w-16 bg-brand-moss/30' />
        </div>

        <div className='max-w-md space-y-2'>
          <p className='font-mono text-xs tracking-wide text-muted/70'>
            Esta sección está siendo construida con el mismo nivel de detalle y
            precisión que caracteriza a nuestros proyectos.
          </p>
          <p className='font-mono text-[10px] tracking-wider text-muted/50'>
            Disponible próximamente.
          </p>
        </div>
      </div>

      {/* Corner decorations (blueprint style) */}
      <div className='absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-brand-moss/20' />
      <div className='absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-brand-moss/20' />
      <div className='absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-brand-moss/20' />
      <div className='absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-brand-moss/20' />
    </motion.div>
  );
}
