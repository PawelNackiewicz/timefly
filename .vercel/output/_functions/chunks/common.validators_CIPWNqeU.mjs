import { z } from 'zod';

const uuidSchema = z.string().uuid("Invalid UUID format");
const pinSchema = z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits");
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});
const sortOrderSchema = z.enum(["asc", "desc"]).optional();
const isoDateSchema = z.string().datetime({ offset: true, message: "Invalid ISO 8601 date format" });

export { paginationSchema as a, isoDateSchema as i, pinSchema as p, sortOrderSchema as s, uuidSchema as u };
