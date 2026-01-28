'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useMyConsorcios } from '../features/consorcios/hooks';
import { useAppStore } from '../features/auth/store';
import type { Consorcio } from '../features/consorcios/types';
import { toast } from 'sonner';
import { easings, transitions } from '../lib/motion';

const easeLuxury: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Mapeo manual de imágenes basado en el nombre del consorcio
const IMAGE_MAP: Record<string, string> = {
  'anton 1': '/anton1.jpeg',
  'anton 2': '/anton2.jpeg',
  'anton 3': '/anton3.jpeg',
  'anton 4': '/anton4.jpeg',
  'anton 5': '/anton5.jpeg',
  'anton 6': '/anton6.jpeg',
};

// Ghost buildings (proyectos futuros)
const GHOST_BUILDINGS = [
  { id: 'ghost-4', name: 'ANTON IV', image: '/anton4.jpeg' },
  { id: 'ghost-5', name: 'ANTON V', image: '/anton5.jpeg' },
  { id: 'ghost-6', name: 'ANTON VI', image: '/anton6.jpeg' },
];

// Skeleton card component
function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: easings.entrance,
        delay: Math.min(index * 0.05, 0.3),
      }}
      className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/5 bg-black"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      {/* Gradient placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/10" />

      {/* Skeleton text */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
      </div>
    </motion.div>
  );
}

interface BuildingCardProps {
  id: string;
  name: string;
  image: string;
  isGhost: boolean;
  isHovered: boolean;
  isDesktop: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function BuildingCard({
  id,
  name,
  image,
  isGhost,
  isHovered,
  isDesktop,
  onHover,
  onLeave,
  onClick,
}: BuildingCardProps) {

  return (
    <motion.div
      whileHover={
        isDesktop && !isGhost
          ? { scale: 1.03, y: -6 }
          : undefined
      }
      whileTap={{ scale: 0.97 }}
      animate={
        isHovered
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0.5, scale: 0.98, filter: 'blur(1px)' }
      }
      transition={{
        ...transitions.cardHover,
        opacity: { duration: 0.5, ease: easings.smooth },
        filter: { duration: 0.5, ease: easings.smooth },
      }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={!isGhost ? onClick : undefined}
      className={`
        relative aspect-[3/4] overflow-hidden rounded-xl border border-white/5 bg-black
        card-shadow-rest hover:card-shadow-hover
        [transform:translateZ(0)] [backface-visibility:hidden]
        transition-shadow duration-500
        ${!isGhost ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      {/* Imagen de fondo */}
      <Image
        src={image}
        alt={name}
        fill
        priority={false}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        quality={90}
        className="object-cover gpu-accelerated"
      />

      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

      {/* Badge "Proyecto 2026" (solo para ghost) */}
      {isGhost && (
        <span className="absolute top-4 right-4 md:top-5 md:right-5 font-mono text-[9px] tracking-[0.2em] font-normal text-beige">
          [ PROYECTO 2026 ]
        </span>
      )}

      {/* Título del edificio */}
      <h2 className="absolute bottom-5 left-5 right-5 md:bottom-6 md:left-6 md:right-6 text-xs md:text-[11px] font-normal tracking-[0.25em] text-white uppercase">
        {name}
      </h2>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const router = useRouter();
  const { data: myConsorcios, isLoading, isError } = useMyConsorcios();
  const { setActiveConsorcio } = useAppStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop for hover states
  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  console.log('[PortfolioPage] Rendering', { isLoading, isError, hasData: !!myConsorcios });

  // Hardcodear los 3 primeros edificios (ANTON 1, 2, 3)
  const realBuildings = useMemo(() => {
    // Obtener el ID real del primer consorcio del backend (si existe)
    const firstConsorcioId = myConsorcios?.[0]?.id || 'temp-anton-1';

    return [
      {
        id: firstConsorcioId,  // ID real del backend
        name: 'ANTON I',
        image: '/anton1.jpeg',
        isGhost: false,
      },
      {
        id: 'temp-anton-2',  // Temporal (no existe en backend)
        name: 'ANTON II',
        image: '/anton2.jpeg',
        isGhost: false,
      },
      {
        id: 'temp-anton-3',  // Temporal (no existe en backend)
        name: 'ANTON III',
        image: '/anton3.jpeg',
        isGhost: false,
      },
    ];
  }, [myConsorcios]);

  // Combinar reales + ghost
  const allBuildings = [
    ...realBuildings,
    ...GHOST_BUILDINGS.map((ghost) => ({ ...ghost, isGhost: true })),
  ];

  const handleSelectBuilding = (id: string) => {
    // ✅ Toast personalizado con nombre del edificio
    const selectedBuilding = allBuildings.find(b => b.id === id);
    const buildingName = selectedBuilding?.name || 'Edificio';

    setActiveConsorcio(id, buildingName);

    toast.success(`${buildingName} seleccionado`);
    router.push('/home');
  };

  // ✅ Mostrar skeleton solo si no hay data en absoluto
  const showSkeleton = isLoading && !myConsorcios;

  if (isError) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="mb-4 text-sm tracking-widest text-red-400">
            ERROR AL CARGAR EDIFICIOS
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/10 bg-brand px-6 py-3 text-[11px] font-bold tracking-[0.3em] text-white transition-all hover:bg-brand-light"
          >
            REINTENTAR
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#0F1115] to-black px-6 py-20 md:px-8 md:py-24 lg:px-16">
      {/* Grid de edificios */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: easeLuxury }}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-5 sm:gap-5 md:gap-6 lg:grid-cols-3"
      >
        <AnimatePresence mode="wait">
          {showSkeleton ? (
            // ✅ Skeleton cards (6 total para coincidir con expected count)
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} index={index} />
            ))
          ) : (
            // ✅ Real cards con data
            allBuildings.map((building, index) => (
              <motion.div
                key={building.id}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.6,
                  ease: easings.entrance,
                  delay: Math.min(index * 0.05, 0.3),
                }}
              >
                <BuildingCard
                  id={building.id}
                  name={building.name}
                  image={building.image}
                  isGhost={building.isGhost}
                  isHovered={hoveredId === null || hoveredId === building.id}
                  isDesktop={isDesktop}
                  onHover={() => setHoveredId(building.id)}
                  onLeave={() => setHoveredId(null)}
                  onClick={() => handleSelectBuilding(building.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

    </main>
  );
}
