import { QueryClient } from '@tanstack/react-query';

/**
 * React Query configuration
 * Shared across the entire application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      gcTime: 1000 * 60 * 5, // 5 minutos (garbage collection time)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
