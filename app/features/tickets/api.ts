import { apiClient } from '../../api/client';
import type { PaginatedResponse } from '../../api/types';
import type { Ticket, TicketComment, CreateTicketPayload, UpdateTicketStatusPayload } from './types';

/**
 * Tickets API endpoints
 * ⚠️ Note: Backend has double prefix /tickets/tickets/
 */
const ROUTES = {
  LIST: '/tickets/tickets/',
  GET: (id: string) => `/tickets/tickets/${id}/`,
  CREATE: '/tickets/tickets/',
  UPDATE_STATUS: (id: string) => `/tickets/tickets/${id}/status/`,
  GET_COMMENTS: (id: string) => `/tickets/tickets/${id}/comments/`,
  ADD_COMMENT: (id: string) => `/tickets/tickets/${id}/comments/`,
};

/**
 * Fetch tickets for a consorcio (paginated)
 * ADMIN sees all, MEMBER sees own only
 */
export const fetchTickets = async (
  consorcioId: string,
  status?: string,
  page: number = 1
): Promise<PaginatedResponse<Ticket>> => {
  const { data } = await apiClient.get<PaginatedResponse<Ticket>>(ROUTES.LIST, {
    params: {
      consorcio_id: consorcioId,
      ...(status && { status }),
      page,
    },
  });
  return data;
};

/**
 * Get ticket details
 */
export const fetchTicket = async (ticketId: string): Promise<Ticket> => {
  const { data } = await apiClient.get<Ticket>(ROUTES.GET(ticketId));
  return data;
};

/**
 * Create ticket
 */
export const createTicket = async (payload: CreateTicketPayload): Promise<Ticket> => {
  const { data } = await apiClient.post<Ticket>(ROUTES.CREATE, payload);
  return data;
};

/**
 * Update ticket status (ADMIN only)
 */
export const updateTicketStatus = async (
  ticketId: string,
  payload: UpdateTicketStatusPayload
): Promise<Ticket> => {
  const { data } = await apiClient.post<Ticket>(ROUTES.UPDATE_STATUS(ticketId), payload);
  return data;
};

/**
 * Get ticket comments
 */
export const fetchTicketComments = async (ticketId: string): Promise<TicketComment[]> => {
  const { data } = await apiClient.get<TicketComment[]>(ROUTES.GET_COMMENTS(ticketId));
  return data;
};

/**
 * Add comment to ticket
 */
export const addTicketComment = async (
  ticketId: string,
  body: string
): Promise<TicketComment> => {
  const { data } = await apiClient.post<TicketComment>(ROUTES.ADD_COMMENT(ticketId), {
    body,
  });
  return data;
};
