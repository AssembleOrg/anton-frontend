'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Sidebar } from './Sidebar';

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  if (pathname === '/login' || pathname === '/') return null;

  // En portfolio, el logo NO debe abrir el sidebar
  const isPortfolio = pathname === '/portfolio';

  return (
    <>
      <div className='fixed left-1/2 top-[max(0.125rem,env(safe-area-inset-top))] z-50 -translate-x-1/2 pointer-events-none md:left-auto md:right-10 md:top-10 md:translate-x-0'>
        {isPortfolio ? (
          // Logo estático (no clickeable) en portfolio
          <div className='pointer-events-auto rounded-xl p-0'>
            <Image
              src='/logo_Anton_blanco.png'
              alt=''
              width={190}
              height={64}
              priority
              className='h-auto w-[160px] md:w-[190px]'
            />
          </div>
        ) : (
          // Logo clickeable en otras rutas (ej: /home)
          <button
            type='button'
            aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
            className='pointer-events-auto rounded-xl p-0 outline-none focus-visible:ring-2 focus-visible:ring-brand/70'
            onClick={() => setOpen((current) => !current)}
          >
            <Image
              src='/logo_Anton_blanco.png'
              alt=''
              width={190}
              height={64}
              priority
              className='h-auto w-[160px] md:w-[190px]'
            />
          </button>
        )}
      </div>
      {!isPortfolio && (
        <Sidebar
          open={open}
          onClose={close}
        />
      )}
    </>
  );
}
