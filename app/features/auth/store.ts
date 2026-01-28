import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';
import { jwtDecode } from 'jwt-decode';

/**
 * JWT Payload structure (según backend SimpleJWT)
 */
interface JWTPayload {
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  exp?: number;
  iat?: number;
}

interface AppStore {
  // Auth
  token: string | null;
  refreshToken: string | null;
  user: User | null;

  // Multi-tenancy
  activeConsorcioId: string | null;
  activeConsorcioName: string | null;

  // Actions
  setAuth: (token: string, refreshToken: string, user: User | null) => void;
  clearAuth: () => void;
  setActiveConsorcio: (id: string | null, name?: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      activeConsorcioId: null,
      activeConsorcioName: null,

      setAuth: (token, refreshToken, user) => {
        console.log('[Store] setAuth called', { hasToken: !!token, hasRefresh: !!refreshToken, user });
        set({ token, refreshToken, user });
        console.log('[Store] setAuth completed, state updated');
      },

      clearAuth: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          activeConsorcioId: null,
          activeConsorcioName: null,
        });
      },

      setActiveConsorcio: (id, name = null) => set({
        activeConsorcioId: id,
        activeConsorcioName: name,
      }),
    }),
    {
      name: 'anton-arts-storage', // localStorage key
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        activeConsorcioId: state.activeConsorcioId,
        activeConsorcioName: state.activeConsorcioName,
        user: state.user, // ✅ Persistir user también
      }),
      // Hydration safety: Si hay token pero no user, decodear automáticamente
      onRehydrateStorage: () => (state) => {
        if (state && state.token && !state.user) {
          try {
            const decoded = jwtDecode<JWTPayload>(state.token);
            const user: User = {
              id: decoded.user_id || '',
              email: decoded.email || '',
              first_name: decoded.first_name || '',
              last_name: decoded.last_name || '',
              username: decoded.username,
            };
            state.user = user;
            console.log('[Auth] User hydrated from token');
          } catch (error) {
            console.error('[Auth] Failed to decode token on hydration:', error);
          }
        }
      },
    },
  ),
);
