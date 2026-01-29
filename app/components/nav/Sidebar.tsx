'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppStore } from '../../features/auth/store';

const easeLuxury: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const activeConsorcioName = useAppStore((state) => state.activeConsorcioName);
  const setBuildingMenuActiveId = useAppStore((state) => state.setBuildingMenuActiveId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handler);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  const items = [
    {
      num: '01',
      label: 'AMENITIES',
      description: 'Áreas comunes y servicios del edificio',
      href: '/home',
      buildingMenuId: 'amenities',
    },
    {
      num: '02',
      label: 'FINANZAS',
      description: 'Pagos, expensas y reportes',
      href: '/home',
      buildingMenuId: 'expensas',
    },
    {
      num: '03',
      label: 'RESIDENTES',
      description: 'Gestión de unidades y propietarios',
      href: '/home',
      buildingMenuId: 'gestion',
    },
    {
      num: '04',
      label: 'ACCESOS',
      description: 'Control de accesos y seguridad',
      href: '/home',
      buildingMenuId: 'accesos',
    },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key='overlay'
            className='fixed inset-0 z-40 bg-black/25 backdrop-blur-xl'
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.25, ease: easeLuxury },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.2, ease: easeLuxury },
            }}
            onClick={onClose}
          />
          <motion.aside
            key='panel'
            className='fixed left-0 top-0 z-50 h-[100dvh] w-full border-r border-white/10 bg-black/40 backdrop-blur-3xl md:w-[400px]'
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: { duration: 0.35, ease: easeLuxury } }}
            exit={{
              x: '-100%',
              transition: { duration: 0.3, ease: easeLuxury },
            }}
          >
            <div className='flex h-full flex-col'>
              <div className='px-5 pt-[max(0.75rem,env(safe-area-inset-top))]'>
                <div className='flex items-center justify-between'>
                  <Image
                    src='/logo_Anton_blanco.png'
                    alt=''
                    width={170}
                    height={58}
                    priority
                    className='h-auto w-[170px]'
                  />
                  <button
                    type='button'
                    aria-label='Cerrar'
                    onClick={onClose}
                    className='relative inline-flex h-10 w-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/70'
                  >
                    <span className='absolute h-px w-5 rotate-45 bg-white/80' />
                    <span className='absolute h-px w-5 -rotate-45 bg-white/80' />
                  </button>
                </div>
              </div>

              {/* Building Indicator */}
              <div className="border-b border-white/5 px-8 py-6">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono tracking-[0.25em] text-beige/60 uppercase">
                    Edificio
                  </div>
                  <div className="text-lg font-light tracking-[0.3em] text-beige">
                    {activeConsorcioName || 'SELECCIONAR PROPIEDAD'}
                  </div>
                  <button
                    onClick={() => router.push('/portfolio')}
                    className="mt-2 block text-[8px] uppercase tracking-[0.3em] text-beige/40 transition-opacity hover:opacity-100 cursor-pointer"
                  >
                    Cambiar Unidad
                  </button>
                </div>
              </div>

              <div className='flex-1 px-6 py-10'>
                <nav className='space-y-7'>
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className='group block'
                      onClick={(e) => {
                        // Prevent default navigation if we're setting BuildingMenu state
                        if (item.buildingMenuId) {
                          e.preventDefault();
                          setBuildingMenuActiveId(item.buildingMenuId);
                          router.push(item.href);
                        }
                        // For non-BuildingMenu items (like Dashboard), let Link handle navigation

                        onClose(); // Always close sidebar
                      }}
                    >
                      <div className='text-[10px] font-light tracking-[0.3em] text-brand-ui'>
                        {item.num}.
                      </div>
                      <div className='mt-1 text-lg font-light tracking-[0.3em] text-[#E5E5E5] transition-colors group-hover:text-brand'>
                        {item.label}
                      </div>
                      <div className='mt-2 text-xs text-white/35'>
                        {item.description}
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className='border-t border-white/5 bg-surface px-6 py-6'>
                <div className='flex items-center gap-2 text-sm text-beige opacity-90'>
                  <User
                    className='h-4 w-4 text-beige/60'
                    strokeWidth={1.5}
                  />
                  <span>Admin Anton</span>
                </div>
                <button
                  type='button'
                  className='mt-3 inline-flex items-center gap-2 text-[#999999] transition-colors hover:text-brand'
                  onClick={onClose}
                >
                  <LogOut
                    className='h-4 w-4'
                    strokeWidth={1.5}
                  />
                  <span className='text-sm'>CERRAR SESIÓN</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
