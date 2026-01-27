import { apiClient } from '../../api/client';
import type { PaginatedResponse } from '../../api/types';
import type { Payment, PaymentResponse } from './types';

/**
 * Payments API endpoints
 * ⚠️ Note: Backend has double prefix /payments/payments/
 */
const ROUTES = {
  LIST: '/payments/payments/',
  GET: (id: string) => `/payments/payments/${id}/`,
  CREATE: '/payments/payments/',
  ISSUE_RECEIPT: (id: string) => `/payments/payments/${id}/receipt/`,
};

/**
 * Fetch payments for a consorcio (paginated)
 * ADMIN sees all, MEMBER sees own only
 */
export const fetchPayments = async (
  consorcioId: string,
  period?: string,
  page: number = 1
): Promise<PaginatedResponse<Payment>> => {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>(ROUTES.LIST, {
    params: {
      consorcio_id: consorcioId,
      ...(period && { period }),
      page,
    },
  });
  return data;
};

/**
 * Get payment details
 */
export const fetchPayment = async (paymentId: string): Promise<Payment> => {
  const { data } = await apiClient.get<Payment>(ROUTES.GET(paymentId));
  return data;
};

/**
 * Create payment (ADMIN only)
 */
export const createPayment = async (payload: {
  consorcio_id: string;
  payer_user_id?: string;
  amount: string;
  currency: 'ARS' | 'USD';
  period: string;
  concept: string;
  method: string;
  note?: string;
}): Promise<PaymentResponse> => {
  const { data } = await apiClient.post<PaymentResponse>(ROUTES.CREATE, payload);
  return data;
};

/**
 * Issue receipt for payment (ADMIN only)
 */
export const issueReceipt = async (paymentId: string) => {
  const { data } = await apiClient.post(ROUTES.ISSUE_RECEIPT(paymentId), {});
  return data;
};
