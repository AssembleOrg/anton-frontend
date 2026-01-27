'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../auth/store';
import { fetchTickets, fetchTicketComments } from './api';

/**
 * Hook to fetch tickets for the active consorcio
 * Reactively refetches when activeConsorcioId changes (part of queryKey)
 */
export const useTickets = (status?: string) => {
  const { activeConsorcioId } = useAppStore();

  return useQuery({
    queryKey: ['tickets', activeConsorcioId, status],
    queryFn: () => {
      if (!activeConsorcioId) throw new Error('No active consorcio');
      return fetchTickets(activeConsorcioId, status);
    },
    enabled: !!activeConsorcioId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

/**
 * Hook to fetch comments for a specific ticket
 */
export const useTicketComments = (ticketId: string | null) => {
  return useQuery({
    queryKey: ['ticket_comments', ticketId],
    queryFn: () => {
      if (!ticketId) throw new Error('No ticket ID');
      return fetchTicketComments(ticketId);
    },
    enabled: !!ticketId,
  });
};
