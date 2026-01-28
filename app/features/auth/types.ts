export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  role?: 'ADMIN' | 'MEMBER';
}

/**
 * Response del backend para POST /api/auth/token/
 * ⚠️ IMPORTANTE: El backend NO devuelve 'user', solo tokens
 */
export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Response para token refresh
 */
export interface RefreshResponse {
  access: string;
}
