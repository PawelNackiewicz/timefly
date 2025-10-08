/**
 * Worker Validators
 *
 * Zod validation schemas for all worker-related endpoints
 */

import { z } from "zod";
import {
  paginationSchema,
  sortOrderSchema,
  uuidSchema,
  pinSchema,
} from "./common.validators";

/**
 * List workers query parameters schema
 * GET /api/workers
 */
export const listWorkersQuerySchema = z.object({
  search: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  is_active: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
  sort_by: z.enum(["first_name", "last_name", "created_at"]).optional(),
  sort_order: sortOrderSchema,
});

/**
 * Worker ID path parameter schema
 * Used in GET/PATCH/DELETE /api/workers/:id
 */
export const workerIdParamSchema = z.object({
  id: uuidSchema,
});

/**
 * Create worker request body schema
 * POST /api/workers
 */
export const createWorkerSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be max 100 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be max 100 characters"),
  pin: pinSchema,
  department: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional(),
});

/**
 * Update worker request body schema
 * PATCH /api/workers/:id
 *
 * All fields optional for partial updates
 * Must provide at least one field
 */
export const updateWorkerSchema = z
  .object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    department: z.string().max(100).optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * Update worker PIN request body schema
 * PATCH /api/workers/:id/pin
 */
export const updateWorkerPinSchema = z.object({
  new_pin: pinSchema,
});
