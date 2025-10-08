/**
 * Worker Management API - Individual Worker Operations
 *
 * GET    /api/workers/:id - Get worker by ID with statistics (Admin only)
 * PATCH  /api/workers/:id - Update worker information (Admin only)
 * DELETE /api/workers/:id - Deactivate worker (Admin only)
 */

import type { APIRoute } from "astro";
import { WorkerService } from "@/lib/services/worker.service";
import {
  workerIdParamSchema,
  updateWorkerSchema,
} from "@/lib/validators/worker.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/workers/:id
 *
 * Retrieve detailed information about a specific worker, including statistics
 *
 * Path Parameters:
 * - id: UUID - Worker ID
 *
 * Returns: 200 OK with worker details and statistics
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Validate path parameter
    const { id } = workerIdParamSchema.parse({ id: context.params.id });

    // Execute business logic
    const workerService = new WorkerService(context.locals.supabase);
    const worker = await workerService.getWorkerById(id);

    // Format response
    return new Response(JSON.stringify(successResponse(worker).body), {
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

/**
 * PATCH /api/workers/:id
 *
 * Update worker information (excluding PIN - use separate endpoint for PIN updates)
 *
 * Path Parameters:
 * - id: UUID - Worker ID
 *
 * Request Body (all fields optional):
 * {
 *   first_name?: string,
 *   last_name?: string,
 *   department?: string,
 *   is_active?: boolean
 * }
 *
 * Returns: 200 OK with updated worker data
 * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Validate path parameter
    const { id } = workerIdParamSchema.parse({ id: context.params.id });

    // Parse and validate request body
    const body = await context.request.json();
    const validatedData = updateWorkerSchema.parse(
      body
    ) as import("@/types").UpdateWorkerCommand;

    // Execute business logic
    const workerService = new WorkerService(context.locals.supabase);
    const worker = await workerService.updateWorker(id, validatedData);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse(worker, "Worker updated successfully").body
      ),
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

/**
 * DELETE /api/workers/:id
 *
 * Soft delete worker by setting is_active to false
 * Worker records are never permanently deleted to maintain data integrity
 *
 * Path Parameters:
 * - id: UUID - Worker ID
 *
 * Returns: 200 OK with success message
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Validate path parameter
    const { id } = workerIdParamSchema.parse({ id: context.params.id });

    // Execute business logic
    const workerService = new WorkerService(context.locals.supabase);
    await workerService.deactivateWorker(id);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse(null, "Worker deactivated successfully").body
      ),
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
