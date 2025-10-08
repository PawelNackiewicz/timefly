/**
 * API Response Utilities
 *
 * Standardize API responses across all endpoints
 */

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMetadata,
} from "@/types";

/**
 * Create a standardized success response
 *
 * @param data - The response data
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 * @returns Formatted success response with status code
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): { body: ApiSuccessResponse<T>; status: number } {
  return {
    body: {
      success: true,
      data,
      ...(message && { message }),
    },
    status,
  };
}

/**
 * Create a standardized error response
 *
 * @param code - Error code from API_ERROR_CODES
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param details - Optional field-specific error details
 * @returns Formatted error response with status code
 */
export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string>
): { body: ApiErrorResponse; status: number } {
  return {
    body: {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    status,
  };
}

/**
 * Generate pagination metadata for list responses
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param totalItems - Total number of items
 * @returns Complete pagination metadata
 */
export function paginationMetadata(
  page: number,
  limit: number,
  totalItems: number
): PaginationMetadata {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    total_items: totalItems,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_previous: page > 1,
  };
}
