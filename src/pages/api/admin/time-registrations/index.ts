/**
 * Admin Time Registration Management API - List and Create
 *
 * GET  /api/admin/time-registrations - List time registrations with filtering (Admin only)
 * POST /api/admin/time-registrations - Create time registration manually (Admin only)
 */

import type { APIRoute } from "astro";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import {
  listTimeRegistrationsQuerySchema,
  createTimeRegistrationSchema,
} from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse, paginationMetadata } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/admin/time-registrations
 *
 * List time registrations with optional filtering, sorting, and pagination
 *
 * Query Parameters:
 * - worker_id: UUID (optional) - Filter by specific worker
 * - status: string (optional) - Filter by status: 'in_progress', 'completed'
 * - manual_intervention: boolean (optional) - Filter by manual intervention flag
 * - date_from: ISO date (optional) - Filter registrations from this date
 * - date_to: ISO date (optional) - Filter registrations until this date
 * - page: number (optional) - Page number (default: 1)
 * - limit: number (optional) - Items per page (default: 20, max: 100)
 * - sort_by: string (optional) - Sort field: 'check_in', 'check_out', 'created_at' (default: 'check_in')
 * - sort_order: string (optional) - Sort direction: 'asc', 'desc' (default: 'desc')
 *
 * Returns: 200 OK with paginated time registration list (includes worker details)
 * Errors: 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = listTimeRegistrationsQuerySchema.parse(queryParams);

    // Execute business logic
    const service = new TimeRegistrationService(context.locals.supabase);
    const result = await service.listTimeRegistrations(validatedParams);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse({
          registrations: result.registrations,
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
 * POST /api/admin/time-registrations
 *
 * Admin manually creates a time registration (check-in) for a worker
 * Sets manual_intervention flag and tracks which admin created it
 *
 * Request Body:
 * {
 *   worker_id: string,    // UUID
 *   check_in: string,     // ISO 8601 timestamp
 *   notes?: string        // Optional notes about manual entry
 * }
 *
 * Returns: 201 Created with time registration data
 * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const POST: APIRoute = async (context) => {
  try {
    // Authenticate admin
    const { admin } = await requireAdmin(context);

    // Parse and validate request body
    const body = await context.request.json();
    const validatedData = createTimeRegistrationSchema.parse(
      body
    ) as import("@/types").CreateTimeRegistrationCommand;

    // Execute business logic
    const service = new TimeRegistrationService(context.locals.supabase);
    const registration = await service.createTimeRegistration(
      validatedData,
      admin.id
    );

    // Format response
    return new Response(
      JSON.stringify(
        successResponse(
          registration,
          "Time registration created successfully",
          201
        ).body
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
