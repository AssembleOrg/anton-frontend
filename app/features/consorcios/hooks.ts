'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../auth/store';
import { fetchMyConsorcios } from './api';

/**
 * Hook para obtener los consorcios del usuario autenticado
 */
export const useMyConsorcios = () => {
  return useQuery({
    queryKey: ['my_consorcios'],
    queryFn: fetchMyConsorcios,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener el activeConsorcioId del store
 */
export const useActiveConsorcio = () => {
  return useAppStore((state) => ({
    activeConsorcioId: state.activeConsorcioId,
    setActiveConsorcio: state.setActiveConsorcio,
  }));
};
