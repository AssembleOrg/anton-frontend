'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMyConsorcios } from '../features/consorcios/hooks';
import { useAppStore } from '../features/auth/store';
import type { Consorcio } from '../features/consorcios/types';
import { toast } from 'sonner';

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
  { id: 'ghost-4', name: 'ANTON 4', image: '/anton4.jpeg' },
  { id: 'ghost-5', name: 'ANTON 5', image: '/anton5.jpeg' },
  { id: 'ghost-6', name: 'ANTON 6', image: '/anton6.jpeg' },
];

interface BuildingCardProps {
  id: string;
  name: string;
  image: string;
  isGhost: boolean;
  isHovered: boolean;
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
  onHover,
  onLeave,
  onClick,
}: BuildingCardProps) {
  return (
    <motion.div
      whileHover={!isGhost ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.4, ease: easeLuxury }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={!isGhost ? onClick : undefined}
      className={`
        relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 bg-black
        [transform:translateZ(0)] [backface-visibility:hidden]
        transition-opacity duration-500
        ${!isGhost ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${!isHovered ? 'opacity-40' : 'opacity-100'}
      `}
    >
      {/* Imagen de fondo */}
      <Image
        src={image}
        alt={name}
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={100}
        className="object-cover"
      />

      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* Badge "Proyecto 2026" (solo para ghost) */}
      {isGhost && (
        <span className="absolute top-4 right-4 rounded border border-white/10 bg-black/50 px-2 py-1 font-mono text-[8px] tracking-wider text-white/40">
          [ PROYECTO 2026 ]
        </span>
      )}

      {/* Título del edificio */}
      <h2 className="absolute bottom-6 left-6 right-6 text-2xl font-light tracking-[0.15em] text-white">
        {name.toUpperCase()}
      </h2>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const router = useRouter();
  const { data: myConsorcios, isLoading, isError } = useMyConsorcios();
  const { setActiveConsorcio } = useAppStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  console.log('[PortfolioPage] Rendering', { isLoading, isError, hasData: !!myConsorcios });

  // Mapear consorcios reales del backend
  const realBuildings =
    myConsorcios?.map((consorcio: Consorcio) => {
      const normalizedName = consorcio.name.toLowerCase().trim();
      const image = IMAGE_MAP[normalizedName] || '/anton1.jpeg'; // Fallback

      return {
        id: consorcio.id,
        name: consorcio.name,
        image,
        isGhost: false,
      };
    }) || [];

  // Combinar reales + ghost
  const allBuildings = [
    ...realBuildings,
    ...GHOST_BUILDINGS.map((ghost) => ({ ...ghost, isGhost: true })),
  ];

  const handleSelectBuilding = (id: string) => {
    setActiveConsorcio(id);
    toast.success('Edificio seleccionado');
    router.push('/home');
  };

  if (isLoading) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
          <p className="text-sm tracking-widest text-brand-light">
            CARGANDO PORTFOLIO
          </p>
        </motion.div>
      </main>
    );
  }

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
    <main className="min-h-[100dvh] bg-background px-4 py-24 md:px-8 lg:px-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easeLuxury }}
        className="mb-12 text-center"
      >
        <span className="text-[10px] font-medium tracking-[0.4em] text-brand-light">
          PORTFOLIO
        </span>
        <h1 className="mt-4 text-4xl font-light tracking-[0.1em] text-white md:text-5xl">
          Selecciona un Edificio
        </h1>
      </motion.div>

      {/* Grid de edificios */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: easeLuxury, delay: 0.2 }}
        className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {allBuildings.map((building, index) => (
          <motion.div
            key={building.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: easeLuxury,
              delay: 0.1 * index,
            }}
          >
            <BuildingCard
              id={building.id}
              name={building.name}
              image={building.image}
              isGhost={building.isGhost}
              isHovered={hoveredId === null || hoveredId === building.id}
              onHover={() => setHoveredId(building.id)}
              onLeave={() => setHoveredId(null)}
              onClick={() => handleSelectBuilding(building.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: easeLuxury, delay: 0.5 }}
        className="mt-12 text-center text-xs tracking-widest text-white/30"
      >
        Selecciona un edificio para acceder al panel de gestión
      </motion.p>
    </main>
  );
}
