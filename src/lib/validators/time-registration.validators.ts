/**
 * Time Registration Validators
 *
 * Zod validation schemas for all time registration and dashboard endpoints
 */

import { z } from "zod";
import {
  paginationSchema,
  sortOrderSchema,
  uuidSchema,
  pinSchema,
  isoDateSchema,
} from "./common.validators";

// =============================================================================
// WORKER TIME REGISTRATION VALIDATORS
// =============================================================================

/**
 * Toggle check-in/check-out request body schema
 * POST /api/time-registrations/toggle
 */
export const toggleTimeRegistrationSchema = z.object({
  pin: pinSchema,
});

// =============================================================================
// ADMIN TIME REGISTRATION VALIDATORS
// =============================================================================

/**
 * List time registrations query parameters schema
 * GET /api/admin/time-registrations
 */
export const listTimeRegistrationsQuerySchema = z.object({
  worker_id: uuidSchema.optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  manual_intervention: z.coerce.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  ...paginationSchema.shape,
  sort_by: z.enum(["check_in", "check_out", "created_at"]).optional(),
  sort_order: sortOrderSchema,
});

/**
 * Time registration ID path parameter schema
 * Used in GET/PATCH/DELETE /api/admin/time-registrations/:id
 */
export const timeRegistrationIdParamSchema = z.object({
  id: uuidSchema,
});

/**
 * Create time registration request body schema
 * POST /api/admin/time-registrations
 */
export const createTimeRegistrationSchema = z.object({
  worker_id: uuidSchema,
  check_in: isoDateSchema,
  notes: z.string().max(1000).optional(),
});

/**
 * Update time registration request body schema
 * PATCH /api/admin/time-registrations/:id
 *
 * All fields optional for partial updates
 * Must provide at least one field
 * Validates check_out > check_in constraint
 */
export const updateTimeRegistrationSchema = z
  .object({
    check_in: isoDateSchema.optional(),
    check_out: isoDateSchema.optional(),
    status: z.enum(["in_progress", "completed"]).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      // If both check_in and check_out are provided, check_out must be after check_in
      if (data.check_in && data.check_out) {
        return new Date(data.check_out) > new Date(data.check_in);
      }
      return true;
    },
    { message: "check_out must be after check_in" }
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// =============================================================================
// DASHBOARD VALIDATORS
// =============================================================================

/**
 * Dashboard statistics query parameters schema
 * GET /api/admin/dashboard/stats
 */
export const dashboardStatsQuerySchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

/**
 * Recent entries query parameters schema
 * GET /api/admin/dashboard/recent-entries
 */
export const recentEntriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
