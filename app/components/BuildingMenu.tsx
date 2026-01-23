'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

type BuildingMenuItem = {
  id: string;
  title: string;
  imageBase: string;
  objectPositionCollapsed: 'top' | 'center' | 'bottom';
  href?: string;
};

const easeOutLuxury: [number, number, number, number] = [0.22, 1, 0.36, 1];

type BuildingMenuLayout = 'mobile' | 'desktop';

function FloorImage({
  imageBase,
  isActive,
  priority,
  seed,
  objectPosition,
}: {
  imageBase: string;
  isActive: boolean;
  priority: boolean;
  seed: number;
  objectPosition: 'top' | 'center' | 'bottom';
}) {
  const candidates = useMemo(
    () => [
      `${imageBase}.png`,
      `${imageBase}.jpg`,
      `${imageBase}.jpeg`,
      `${imageBase}.webp`,
    ],
    [imageBase],
  );
  const [srcIndex, setSrcIndex] = useState(0);
  const delay = useMemo(() => (seed % 7) * 0.6, [seed]);

  return (
    <motion.div
      aria-hidden='true'
      className='absolute inset-0'
      animate={
        isActive
          ? {
              scale: [1.04, 1.06],
              y: [0, -10],
            }
          : { scale: 1.03, y: 0 }
      }
      transition={{
        duration: 30,
        ease: 'linear',
        repeat: isActive ? Number.POSITIVE_INFINITY : 0,
        repeatType: 'mirror',
        delay: isActive ? delay : 0,
      }}
    >
      <Image
        src={candidates[srcIndex] ?? candidates[0] ?? imageBase}
        alt=''
        fill
        priority={priority}
        quality={100}
        onError={() => {
          setSrcIndex((current) =>
            current < candidates.length - 1 ? current + 1 : current,
          );
        }}
        className={[
          'object-cover',
          objectPosition === 'top'
            ? 'object-top'
            : objectPosition === 'bottom'
              ? 'object-bottom'
              : 'object-center',
          'transition-[filter] duration-700',
          'ease-[cubic-bezier(0.22,1,0.36,1)]',
          isActive
            ? 'grayscale-0 blur-0 brightness-100'
            : 'grayscale blur-[1px] brightness-95',
          'image-rendering-auto',
        ].join(' ')}
        sizes='100vw'
      />
    </motion.div>
  );
}

function Floors({
  items,
  activeId,
  setActiveId,
  layout,
}: {
  items: BuildingMenuItem[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  layout: BuildingMenuLayout;
}) {
  const hasActive = activeId !== null;

  return (
    <div className='flex h-full w-full flex-col divide-y divide-white/10'>
      {items.map((item, index) => {
        const isActive = activeId === item.id;
        const flexGrow = !hasActive
          ? 1
          : isActive
            ? layout === 'desktop'
              ? 1.85
              : 2
            : layout === 'desktop'
              ? 1.15
              : 1.25;

        return (
          <motion.button
            key={item.id}
            type='button'
            layout
            aria-pressed={isActive}
            onClick={() => setActiveId(item.id)}
            onMouseEnter={
              layout === 'desktop' ? () => setActiveId(item.id) : undefined
            }
            animate={{ flexGrow }}
            transition={{
              duration: layout === 'desktop' ? 0.9 : 0.95,
              ease: easeOutLuxury,
            }}
            className='group relative w-full basis-0 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/70'
          >
            <div className='absolute inset-0'>
              <FloorImage
                imageBase={item.imageBase}
                isActive={isActive}
                priority={item.id === 'amenities'}
                seed={index}
                objectPosition={
                  isActive ? 'center' : item.objectPositionCollapsed
                }
              />
              <div
                className={[
                  'absolute inset-0 pointer-events-none',
                  'bg-gradient-to-b from-black/55 via-black/15 to-black/60',
                  isActive ? 'opacity-55' : 'opacity-65',
                ].join(' ')}
              />
              <motion.div
                aria-hidden='true'
                className='absolute inset-0 pointer-events-none bg-black/10 backdrop-blur-[2px]'
                initial={false}
                animate={{ opacity: isActive ? 0 : 1 }}
                transition={{ duration: 0.35, ease: easeOutLuxury }}
              />
            </div>

            <div
              className={[
                'relative flex h-full w-full items-end',
                layout === 'desktop'
                  ? 'px-7 pt-7 pb-10'
                  : 'px-7 pt-7 pb-[max(2.75rem,env(safe-area-inset-bottom))]',
              ].join(' ')}
            >
              <div className='w-full'>
                <div className='flex items-center justify-between gap-4'>
                  <h2 className='text-lg font-medium tracking-widest text-foreground'>
                    {item.title}
                  </h2>
                </div>

                <AnimatePresence initial={false}>
                  {isActive && layout === 'mobile' ? (
                    <motion.div
                      key='content'
                      initial={{ opacity: 0, y: 8 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.35,
                          ease: easeOutLuxury,
                          delay: 0.2,
                        },
                      }}
                      exit={{
                        opacity: 0,
                        y: 0,
                        transition: { duration: 0.05, ease: easeOutLuxury },
                      }}
                      className='mt-4 inline-flex w-full items-center justify-end gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md'
                    >
                      {/* <span className="text-sm text-muted">Ver detalle</span> */}
                      <span className='inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-brand-light'>
                        Gestionar <ArrowRight className='h-4 w-4' />
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function DesktopContent({
  activeId,
  items,
}: {
  activeId: string | null;
  items: BuildingMenuItem[];
}) {
  const selected = activeId ? items.find((i) => i.id === activeId) : null;
  const title = selected?.title ?? 'ANTON';

  return (
    <div className='relative flex h-[100dvh] flex-1 flex-col bg-background'>
      <div className='h-full w-full border-l border-white/5 shadow-[inset_1px_0_0_rgba(255,255,255,0.04)]'>
        <div className='h-full w-full px-12 py-12'>
          <AnimatePresence
            mode='wait'
            initial={false}
          >
            <motion.div
              key={activeId ?? 'welcome'}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: easeOutLuxury },
              }}
              exit={{
                opacity: 0,
                y: -6,
                transition: { duration: 0.25, ease: easeOutLuxury },
              }}
              className='h-full w-full'
            >
              {selected ? (
                <div className='max-w-2xl rounded-3xl border border-white/10 bg-surface/40 p-10 backdrop-blur-md'>
                  <div className='text-xs tracking-[0.38em] text-muted'>
                    PANEL ADMINISTRATIVO
                  </div>
                  <div className='mt-4 text-3xl font-medium tracking-widest text-foreground'>
                    {title}
                  </div>
                </div>
              ) : (
                <div className='flex h-full w-full items-center'>
                  <div className='max-w-xl'>
                    <div className='text-xs tracking-[0.38em] text-muted'>
                      WELCOME
                    </div>
                    <div className='mt-2'>
                      <Image
                        src='/logo_Anton_blanco.png'
                        alt=''
                        width={320}
                        height={108}
                        priority
                        className='h-auto w-[288px] md:w-[320px]'
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function BuildingMenu() {
  const items = useMemo<BuildingMenuItem[]>(
    () => [
      {
        id: 'amenities',
        title: 'AMENITIES',
        imageBase: '/1',
        objectPositionCollapsed: 'top',
        href: '/amenities',
      },
      {
        id: 'expensas',
        title: 'EXPENSAS',
        imageBase: '/2',
        objectPositionCollapsed: 'center',
        href: '/expensas',
      },
      {
        id: 'gestion',
        title: 'GESTIÓN',
        imageBase: '/3',
        objectPositionCollapsed: 'center',
        href: '/gestion',
      },
      {
        id: 'accesos',
        title: 'ACCESOS',
        imageBase: '/4',
        objectPositionCollapsed: 'bottom',
        href: '/accesos',
      },
    ],
    [],
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className='building-menu h-[100dvh] w-full bg-background'>
      <div className='h-[100dvh] w-full md:hidden'>
        <Floors
          items={items}
          activeId={activeId}
          setActiveId={(id) => setActiveId(id)}
          layout='mobile'
        />
      </div>

      <div className='hidden h-[100dvh] w-full md:flex'>
        <aside className='h-[100dvh] w-[400px] flex-none bg-background'>
          <Floors
            items={items}
            activeId={activeId}
            setActiveId={(id) => setActiveId(id)}
            layout='desktop'
          />
        </aside>
        <DesktopContent
          activeId={activeId}
          items={items}
        />
      </div>
    </section>
  );
}
