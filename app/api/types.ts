/**
 * Standard success response from backend
 */
export interface ApiSuccessResponse<T = any> {
  ok: true;
  data: T;
  meta: {
    status: number;
    request_id: string;
  };
}

/**
 * Standard error response from backend
 */
export interface ApiErrorResponse {
  ok: false;
  error: {
    code:
      | 'validation_error'
      | 'unauthorized'
      | 'forbidden'
      | 'not_found'
      | 'conflict'
      | 'rate_limited'
      | 'server_error'
      | 'error';
    message: string;
    details?: Record<string, any>;
  };
  meta: {
    status: number;
    request_id: string;
  };
}

/**
 * Union type for any API response
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated response structure (DRF pagination)
 */
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
}
