/**
 * Worker PIN Management API
 *
 * PATCH /api/workers/:id/pin - Update worker's PIN (Admin only)
 */

import type { APIRoute } from "astro";
import { WorkerService } from "@/lib/services/worker.service";
import {
  workerIdParamSchema,
  updateWorkerPinSchema,
} from "@/lib/validators/worker.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * PATCH /api/workers/:id/pin
 *
 * Update worker's PIN separately for enhanced security
 * PIN updates are logged separately from other worker updates
 *
 * Path Parameters:
 * - id: UUID - Worker ID
 *
 * Request Body:
 * {
 *   new_pin: string  // 4-6 digits
 * }
 *
 * Returns: 200 OK with success message
 * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // Authenticate admin and get authenticated client
    const { supabase: authSupabase } = await requireAdmin(context);

    // Validate path parameter
    const { id } = workerIdParamSchema.parse({ id: context.params.id });

    // Parse and validate request body
    const body = await context.request.json();
    const { new_pin } = updateWorkerPinSchema.parse(body);

    // Execute business logic with authenticated client
    const workerService = new WorkerService(authSupabase);
    await workerService.updateWorkerPin(id, new_pin);

    // Format response
    return new Response(
      JSON.stringify(successResponse(null, "PIN updated successfully").body),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
