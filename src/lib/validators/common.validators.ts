/**
 * Common Validators
 *
 * Reusable Zod validation schemas shared across multiple endpoints
 */

import { z } from "zod";

/**
 * UUID validation schema
 * Validates standard UUID v4 format
 */
export const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * PIN validation schema
 * Validates worker PIN format (4-6 digits only)
 */
export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, "PIN must be 4-6 digits");

/**
 * Pagination query parameters schema
 * Used for list endpoints with pagination
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * Sort order schema
 * Validates ascending or descending sort direction
 */
export const sortOrderSchema = z.enum(["asc", "desc"]).optional();

/**
 * ISO 8601 date string validation schema
 * Validates datetime format with timezone
 */
export const isoDateSchema = z
  .string()
  .datetime("Invalid ISO 8601 date format");
