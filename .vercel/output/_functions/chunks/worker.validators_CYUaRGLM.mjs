import { z } from 'zod';
import { s as sortOrderSchema, a as paginationSchema, u as uuidSchema, p as pinSchema } from './common.validators_CIPWNqeU.mjs';

const listWorkersQuerySchema = z.object({
  search: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  is_active: z.union([z.boolean(), z.string()]).optional().transform((val) => {
    if (val === void 0) return void 0;
    if (typeof val === "boolean") return val;
    if (val === "true" || val === "1") return true;
    if (val === "false" || val === "0") return false;
    return Boolean(val);
  }),
  ...paginationSchema.shape,
  sort_by: z.enum(["first_name", "last_name", "created_at"]).optional(),
  sort_order: sortOrderSchema
});
const workerIdParamSchema = z.object({
  id: uuidSchema
});
const createWorkerSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name must be max 100 characters"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name must be max 100 characters"),
  pin: pinSchema,
  department: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional()
});
const updateWorkerSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  department: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});
const updateWorkerPinSchema = z.object({
  new_pin: pinSchema
});

export { updateWorkerSchema as a, createWorkerSchema as c, listWorkersQuerySchema as l, updateWorkerPinSchema as u, workerIdParamSchema as w };
