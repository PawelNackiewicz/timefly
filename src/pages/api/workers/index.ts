/**
 * Worker Management API - List and Create
 *
 * GET  /api/workers - List workers with filtering and pagination (Admin only)
 * POST /api/workers - Create new worker (Admin only)
 */

import type { APIRoute } from "astro";
import { WorkerService } from "@/lib/services/worker.service";
import {
  listWorkersQuerySchema,
  createWorkerSchema,
} from "@/lib/validators/worker.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse, paginationMetadata } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/workers
 *
 * List workers with optional filtering, sorting, and pagination
 *
 * Query Parameters:
 * - search: string (optional) - Search by first_name or last_name
 * - department: string (optional) - Filter by department
 * - is_active: boolean (optional) - Filter by active status (default: true)
 * - page: number (optional) - Page number (default: 1)
 * - limit: number (optional) - Items per page (default: 20, max: 100)
 * - sort_by: string (optional) - Sort field: 'first_name', 'last_name', 'created_at'
 * - sort_order: string (optional) - Sort direction: 'asc', 'desc'
 *
 * Returns: 200 OK with paginated worker list
 * Errors: 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = listWorkersQuerySchema.parse(queryParams);

    // Execute business logic
    const workerService = new WorkerService(context.locals.supabase);
    const result = await workerService.listWorkers(validatedParams);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse({
          workers: result.workers,
          pagination: paginationMetadata(
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total_items
          ),
        }).body
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
 * POST /api/workers
 *
 * Create a new worker with PIN authentication
 *
 * Request Body:
 * {
 *   first_name: string,
 *   last_name: string,
 *   pin: string,          // 4-6 digits
 *   department?: string,
 *   is_active?: boolean
 * }
 *
 * Returns: 201 Created with worker data
 * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const POST: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Parse and validate request body
    const body = await context.request.json();
    const validatedData = createWorkerSchema.parse(
      body
    ) as import("@/types").CreateWorkerCommand;

    // Execute business logic
    const workerService = new WorkerService(context.locals.supabase);
    const worker = await workerService.createWorker(validatedData);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse(worker, "Worker created successfully", 201).body
      ),
      {
        status: 201,
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
