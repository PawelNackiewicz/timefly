/**
 * Admin Time Registration Management API - Individual Registration Operations
 *
 * GET    /api/admin/time-registrations/:id - Get time registration by ID (Admin only)
 * PATCH  /api/admin/time-registrations/:id - Update time registration (Admin only)
 * DELETE /api/admin/time-registrations/:id - Delete time registration (Admin only)
 */

import type { APIRoute } from "astro";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import {
  timeRegistrationIdParamSchema,
  updateTimeRegistrationSchema,
} from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/admin/time-registrations/:id
 *
 * Retrieve detailed information about a specific time registration
 * Includes worker details and admin who made modifications (if any)
 *
 * Path Parameters:
 * - id: UUID - Registration ID
 *
 * Returns: 200 OK with time registration details (includes worker and admin info)
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin and get authenticated client
    const { supabase: authSupabase } = await requireAdmin(context);

    // Validate path parameter
    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id,
    });

    // Execute business logic with authenticated client
    const service = new TimeRegistrationService(authSupabase);
    const registration = await service.getTimeRegistrationById(id);

    // Format response
    return new Response(JSON.stringify(successResponse(registration).body), {
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
 * PATCH /api/admin/time-registrations/:id
 *
 * Update time registration (manual check-out or corrections)
 * Automatically sets manual_intervention flag and tracks admin making changes
 * Auto-completes status to 'completed' when check_out is provided
 *
 * Path Parameters:
 * - id: UUID - Registration ID
 *
 * Request Body (all fields optional):
 * {
 *   check_in?: string,     // ISO 8601 timestamp
 *   check_out?: string,    // ISO 8601 timestamp (must be after check_in)
 *   status?: string,       // 'in_progress' | 'completed'
 *   notes?: string         // Additional notes
 * }
 *
 * Returns: 200 OK with updated time registration data
 * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // Authenticate admin and get authenticated client
    const { admin, supabase: authSupabase } = await requireAdmin(context);

    // Validate path parameter
    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id,
    });

    // Parse and validate request body
    const body = await context.request.json();
    const validatedData = updateTimeRegistrationSchema.parse(
      body
    ) as import("@/types").UpdateTimeRegistrationCommand;

    // Execute business logic with authenticated client
    const service = new TimeRegistrationService(authSupabase);
    const registration = await service.updateTimeRegistration(
      id,
      validatedData,
      admin.id
    );

    // Format response
    return new Response(
      JSON.stringify(
        successResponse(registration, "Time registration updated successfully")
          .body
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
 * DELETE /api/admin/time-registrations/:id
 *
 * Permanently delete a time registration
 * Use with caution - this action cannot be undone
 * Consider soft delete or status change for audit trail
 *
 * Path Parameters:
 * - id: UUID - Registration ID
 *
 * Returns: 200 OK with success message
 * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Authenticate admin and get authenticated client
    const { supabase: authSupabase } = await requireAdmin(context);

    // Validate path parameter
    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id,
    });

    // Execute business logic with authenticated client
    const service = new TimeRegistrationService(authSupabase);
    await service.deleteTimeRegistration(id);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse(null, "Time registration deleted successfully").body
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
