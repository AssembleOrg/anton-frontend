'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../auth/store';
import { fetchPayments } from './api';

/**
 * Hook to fetch payments for the active consorcio
 * Reactively refetches when activeConsorcioId changes (part of queryKey)
 */
export const usePayments = (period?: string) => {
  const { activeConsorcioId } = useAppStore();

  return useQuery({
    queryKey: ['payments', activeConsorcioId, period],
    queryFn: () => {
      if (!activeConsorcioId) throw new Error('No active consorcio');
      return fetchPayments(activeConsorcioId, period);
    },
    enabled: !!activeConsorcioId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};
