/**
 * Dashboard Recent Entries API
 *
 * GET /api/admin/dashboard/recent-entries - Get recent time registration entries (Admin only)
 */

import type { APIRoute } from "astro";
import { DashboardService } from "@/lib/services/dashboard.service";
import { recentEntriesQuerySchema } from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/admin/dashboard/recent-entries
 *
 * Retrieve recent time registration entries for dashboard display
 * Useful for showing latest activity and monitoring current operations
 *
 * Query Parameters:
 * - limit: number (optional) - Number of entries to return (default: 10, max: 50)
 *
 * Response Structure:
 * {
 *   success: true,
 *   data: {
 *     entries: [
 *       {
 *         id: string,
 *         worker: { id, first_name, last_name },
 *         check_in: string,
 *         check_out: string | null,
 *         duration_hours?: number,
 *         status: string,
 *         manual_intervention: boolean,
 *         created_at: string
 *       }
 *     ]
 *   }
 * }
 *
 * Returns: 200 OK with list of recent entries
 * Errors: 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { limit } = recentEntriesQuerySchema.parse(queryParams);

    // Execute business logic
    const service = new DashboardService(context.locals.supabase);
    const entries = await service.getRecentEntries(limit);

    // Format response
    return new Response(JSON.stringify(successResponse({ entries }).body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
