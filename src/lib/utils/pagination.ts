/**
 * Pagination Utilities
 *
 * Handle pagination logic consistently across all list endpoints
 */

import { PAGINATION_DEFAULTS } from "@/types";

/**
 * Pagination parameters input
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Parse and validate pagination parameters with safe defaults
 *
 * @param params - Raw pagination parameters from query string
 * @returns Validated pagination parameters with offset calculation
 *
 * @example
 * const { page, limit, offset } = parsePaginationParams({ page: 2, limit: 20 });
 * // Returns: { page: 2, limit: 20, offset: 20 }
 */
export function parsePaginationParams(params: PaginationParams) {
  // Ensure page is at least 1
  const page = Math.max(1, params.page || PAGINATION_DEFAULTS.PAGE);

  // Ensure limit is between 1 and MAX_LIMIT
  const limit = Math.min(
    Math.max(1, params.limit || PAGINATION_DEFAULTS.LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  // Calculate offset for database query
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
