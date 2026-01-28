'use client';

import { useMutation } from '@tanstack/react-query';
import { useAppStore } from './store';
import { login as loginApi } from './api';
import type { LoginPayload } from './types';
import { jwtDecode } from 'jwt-decode';

/**
 * JWT Payload structure (según backend SimpleJWT)
 * Puede variar según configuración del backend
 */
interface JWTPayload {
  user_id?: string;
  email?: string;
  exp?: number;
  iat?: number;
  // Campos opcionales que el backend puede incluir
  first_name?: string;
  last_name?: string;
  username?: string;
}

/**
 * Hook para manejar login
 * Decodea el JWT para extraer info básica del user
 */
export const useLogin = () => {
  const { setAuth } = useAppStore();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      console.log('[useLogin] Calling API with credentials');
      const response = await loginApi(credentials);
      console.log('[useLogin] API response received', { hasAccess: !!response.access, hasRefresh: !!response.refresh });
      return response;
    },
    onSuccess: (data) => {
      console.log('[useLogin] onSuccess started');
      try {
        // Decodear JWT access token
        const decoded = jwtDecode<JWTPayload>(data.access);
        console.log('[useLogin] JWT decoded', { userId: decoded.user_id, email: decoded.email });

        // Construir objeto User con defaults seguros
        const user = {
          id: decoded.user_id || '',
          email: decoded.email || '',
          first_name: decoded.first_name || '',
          last_name: decoded.last_name || '',
          username: decoded.username,
        };

        console.log('[useLogin] Calling setAuth');
        setAuth(data.access, data.refresh, user);
        console.log('[useLogin] setAuth completed');
      } catch (error) {
        // Fallback: Si falla el decode, guardamos sin user
        console.error('[Auth] Failed to decode JWT:', error);
        setAuth(data.access, data.refresh, null);
        throw new Error('Failed to decode authentication token');
      }
    },
    onError: (error: any) => {
      console.error('[Auth] Login failed:', {
        message: error?.message,
        code: error?.code,
        fullError: error,
      });
    },
  });
};

/**
 * Hook para obtener estado de auth
 */
export const useAuth = () => {
  return useAppStore((state) => ({
    token: state.token,
    user: state.user,
    isAuthenticated: !!state.token,
  }));
};

/**
 * Hook para logout
 */
export const useLogout = () => {
  const { clearAuth } = useAppStore();

  return () => {
    clearAuth();
    window.location.href = '/login';
  };
};
