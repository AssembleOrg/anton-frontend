import axios from 'axios';
import { ENV } from '../config/env';
import { useAppStore } from '../features/auth/store';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request: Inyectar Bearer token
 */
apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de response: Unwrap envelope + Refresh token logic
 */
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap: { ok, data, meta } → return { ...response, data: data }
    if (response.data?.ok) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ FIX: Don't try to refresh on auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/token/') ||
      originalRequest.url?.includes('/auth/token/refresh/');

    // Si 401 y NO es endpoint de auth y no es retry, intentar refresh
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, user } = useAppStore.getState();

      if (refreshToken) {
        try {
          // Llamar refresh sin interceptor (para evitar loop infinito)
          const { data } = await axios.post(
            `${ENV.API_URL}/auth/token/refresh/`,
            { refresh: refreshToken },
          );

          // El backend devuelve { ok: true, data: { access: "..." }, meta: {...} }
          const newAccessToken = data?.data?.access || data?.access;

          // Actualizar token en store (y cookie automáticamente via setAuth)
          useAppStore.getState().setAuth(newAccessToken, refreshToken, user);

          // Retry original request con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh falló → logout y redirect
          useAppStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token → logout
        useAppStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Loguear request_id para debugging
    const requestId = error.response?.headers['x-request-id'];
    if (requestId) {
      console.error('[API Error]', {
        code: error.response?.data?.error?.code,
        message: error.response?.data?.error?.message,
        requestId,
      });
    }

    return Promise.reject(error.response?.data?.error || error);
  },
);
