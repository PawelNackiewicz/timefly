/**
 * Time Registration Toggle API - Worker Check-in/Check-out
 *
 * POST /api/time-registrations/toggle - Toggle check-in/check-out using PIN (No authentication required)
 */

import type { APIRoute } from "astro";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import { toggleTimeRegistrationSchema } from "@/lib/validators/time-registration.validators";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * POST /api/time-registrations/toggle
 *
 * Worker check-in or check-out using PIN authentication
 * Automatically determines action based on current state:
 * - No active registration → Check-in (201 Created)
 * - Active registration exists → Check-out (200 OK)
 *
 * Security Notes:
 * - No JWT authentication required (PIN-based only)
 * - Each action requires PIN verification
 * - No session/token created
 * - Should implement rate limiting (10 requests/minute per IP)
 *
 * Request Body:
 * {
 *   pin: string  // 4-6 digits
 * }
 *
 * Response (Check-in):
 * {
 *   success: true,
 *   data: {
 *     action: "check_in",
 *     registration: { id, worker_id, check_in, status, ... },
 *     worker: { id, first_name, last_name }
 *   },
 *   message: "Check-in successful"
 * }
 *
 * Response (Check-out):
 * {
 *   success: true,
 *   data: {
 *     action: "check_out",
 *     registration: { id, worker_id, check_in, check_out, duration_hours, status, ... },
 *     worker: { id, first_name, last_name }
 *   },
 *   message: "Check-out successful"
 * }
 *
 * Returns: 201 Created (check-in) or 200 OK (check-out)
 * Errors: 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
 */
export const POST: APIRoute = async (context) => {
  try {
    // Parse and validate request body
    const body = await context.request.json();
    const { pin } = toggleTimeRegistrationSchema.parse(body);

    // Execute business logic (PIN-based authentication)
    const service = new TimeRegistrationService(context.locals.supabase);
    const result = await service.toggleCheckInOut(pin);

    // Determine response message and status based on action
    const message =
      result.action === "check_in"
        ? "Check-in successful"
        : "Check-out successful";

    const status = result.action === "check_in" ? 201 : 200;

    // Format response
    return new Response(
      JSON.stringify(successResponse(result, message, status).body),
      {
        status,
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
