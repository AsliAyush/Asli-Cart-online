/**
 * Standard API Response structure matching the Asli Cart backend format.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiValidationError[] | Record<string, unknown> | string;
}

/**
 * Validation error details returned by backend Zod / middleware.
 */
export interface ApiValidationError {
  field?: string;
  message: string;
}

/**
 * Standard pagination metadata for lists and tables.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated data envelope.
 */
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Backend pagination object as returned by ResponseFormatter.paginated.
 */
export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Backend paginated envelope as returned in ApiResponse.data.
 */
export interface BackendPaginatedData<T> {
  items: T[];
  pagination: BackendPagination;
}

/**
 * Backend health check payload structure.
 */
export interface HealthStatusResponse {
  status: "UP" | "DEGRADED";
  environment: string;
  uptime: number;
  timestamp: string;
  database: "connected" | "disconnected";
}

