import { apiClient } from '../../api/client';
import type { Consorcio } from './types';

/**
 * Consorcios API endpoints
 * Routes are inline - only what this feature needs
 */
const ROUTES = {
  MY_CONSORCIOS: '/accounts/consorcios/my_consorcios/',
  GET_CONSORCIO: (id: string) => `/accounts/consorcios/${id}/`,
  GET_MEMBERS: (id: string) => `/accounts/consorcios/${id}/members/`,
};

/**
 * Fetch list of user's consorcios
 */
export const fetchMyConsorcios = async (): Promise<Consorcio[]> => {
  const { data } = await apiClient.get<Consorcio[]>(ROUTES.MY_CONSORCIOS);
  return data;
};

/**
 * Fetch specific consorcio details
 */
export const fetchConsorcio = async (consorcioId: string): Promise<Consorcio> => {
  const { data } = await apiClient.get<Consorcio>(ROUTES.GET_CONSORCIO(consorcioId));
  return data;
};

/**
 * Fetch members of a consorcio
 */
export const fetchMembers = async (
  consorcioId: string,
  searchQuery?: string,
  page: number = 1
) => {
  const { data } = await apiClient.get(ROUTES.GET_MEMBERS(consorcioId), {
    params: {
      ...(searchQuery && { search: searchQuery }),
      page,
    },
  });
  return data;
};
