/**
 * Active Workers API - Public endpoint for clock kiosk
 *
 * GET /api/workers/active - List active workers (No authentication required)
 */

import type { APIRoute } from "astro";
import { WorkerService } from "@/lib/services/worker.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/workers/active
 *
 * List all active workers for clock-in/out kiosk
 * Returns minimal information (no sensitive data like PIN)
 *
 * Security Notes:
 * - No authentication required (public kiosk)
 * - Only returns active workers
 * - Excludes sensitive fields (pin_hash, etc.)
 * - No pagination (assumes reasonable number of workers)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     workers: [
 *       {
 *         id: string,
 *         first_name: string,
 *         last_name: string,
 *         department: string,
 *         has_active_registration: boolean
 *       }
 *     ]
 *   }
 * }
 *
 * Returns: 200 OK
 * Errors: 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Use service role client for public access
    const workerService = new WorkerService(context.locals.supabase);

    // Fetch only active workers
    const result = await workerService.listWorkers({
      is_active: true,
      limit: 1000, // Get all active workers
    });

    // Get active registrations to determine who is currently clocked in
    const { data: activeRegistrations } = await context.locals.supabase
      .from("time_registrations")
      .select("worker_id")
      .eq("status", "in_progress");

    const activeWorkerIds = new Set(
      activeRegistrations?.map((reg) => reg.worker_id) || []
    );

    // Format response with minimal data and active status
    const workers = result.workers.map((worker) => ({
      id: worker.id,
      first_name: worker.first_name,
      last_name: worker.last_name,
      department: worker.department,
      has_active_registration: activeWorkerIds.has(worker.id),
    }));

    return new Response(JSON.stringify(successResponse({ workers }).body), {
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
