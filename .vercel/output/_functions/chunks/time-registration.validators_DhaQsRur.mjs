import { z } from 'zod';
import { p as pinSchema, s as sortOrderSchema, a as paginationSchema, u as uuidSchema, i as isoDateSchema } from './common.validators_CIPWNqeU.mjs';

const toggleTimeRegistrationSchema = z.object({
  pin: pinSchema
});
const listTimeRegistrationsQuerySchema = z.object({
  worker_id: uuidSchema.optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  manual_intervention: z.coerce.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  ...paginationSchema.shape,
  sort_by: z.enum(["check_in", "check_out", "created_at"]).optional(),
  sort_order: sortOrderSchema
});
const timeRegistrationIdParamSchema = z.object({
  id: uuidSchema
});
const createTimeRegistrationSchema = z.object({
  worker_id: uuidSchema,
  check_in: isoDateSchema,
  notes: z.string().max(1e3).optional()
});
const updateTimeRegistrationSchema = z.object({
  check_in: isoDateSchema.optional(),
  check_out: isoDateSchema.optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  notes: z.string().max(1e3).optional()
}).refine(
  (data) => {
    if (data.check_in && data.check_out) {
      return new Date(data.check_out) > new Date(data.check_in);
    }
    return true;
  },
  { message: "check_out must be after check_in" }
).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});
const dashboardStatsQuerySchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional()
});
const recentEntriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional()
});

export { toggleTimeRegistrationSchema as a, createTimeRegistrationSchema as c, dashboardStatsQuerySchema as d, listTimeRegistrationsQuerySchema as l, recentEntriesQuerySchema as r, timeRegistrationIdParamSchema as t, updateTimeRegistrationSchema as u };
