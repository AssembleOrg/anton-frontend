import { apiClient } from '../../api/client';
import type { LoginPayload, LoginResponse, RefreshResponse } from './types';

/**
 * Auth API endpoints
 * Routes are inline - only what this feature needs
 */
const ROUTES = {
  LOGIN: '/auth/token/',
  REFRESH: '/auth/token/refresh/',
};

/**
 * Login with email and password
 * Returns access and refresh tokens
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post(ROUTES.LOGIN, payload);
  return data;
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshTokenValue: string): Promise<RefreshResponse> => {
  const { data } = await apiClient.post(ROUTES.REFRESH, { refresh: refreshTokenValue });
  return data;
};
