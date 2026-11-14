import { AxiosError } from "axios";
import type { ApiResponse, ApiValidationError } from "@/types/api";

/**
 * Custom application-level API Error class to normalize backend and network errors.
 */
export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly errors?: ApiValidationError[] | Record<string, unknown> | string;
  public readonly isNetworkError: boolean;

  constructor(
    message: string,
    statusCode?: number,
    errors?: ApiValidationError[] | Record<string, unknown> | string,
    isNetworkError = false
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Type guard to check if an error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extracts a user-friendly error message from an unknown error or Axios error.
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

