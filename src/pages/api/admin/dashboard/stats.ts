/**
 * Dashboard Statistics API
 *
 * GET /api/admin/dashboard/stats - Get comprehensive dashboard KPI metrics (Admin only)
 */

import type { APIRoute } from "astro";
import { DashboardService } from "@/lib/services/dashboard.service";
import { dashboardStatsQuerySchema } from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/admin/dashboard/stats
 *
 * Retrieve aggregated KPI metrics for administrative dashboard
 *
 * Provides comprehensive statistics including:
 * - Time period range
 * - Registration statistics (total, completed, in_progress, manual interventions with rates)
 * - Worker statistics (total, active, inactive, with active registration)
 * - Work hours statistics (total, averages per registration and per worker)
 * - Performance metrics (successful registration rate)
 * - Recent activity (today's registrations and hours)
 *
 * Query Parameters:
 * - date_from: ISO date (optional) - Calculate stats from this date (default: 30 days ago)
 * - date_to: ISO date (optional) - Calculate stats until this date (default: today)
 *
 * Response Structure:
 * {
 *   success: true,
 *   data: {
 *     time_period: { from: string, to: string },
 *     registrations: { total, completed, in_progress, manual_interventions, manual_intervention_rate },
 *     workers: { total, active, inactive, with_active_registration },
 *     work_hours: { total_hours, average_per_registration, average_per_worker },
 *     performance: { average_registration_time_seconds, successful_registrations_rate },
 *     recent_activity: { today_registrations, today_hours }
 *   }
 * }
 *
 * Returns: 200 OK with dashboard statistics
 * Errors: 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity, 500 Internal Server Error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin and get authenticated client
    const { supabase: authSupabase } = await requireAdmin(context);

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { date_from, date_to } = dashboardStatsQuerySchema.parse(queryParams);

    // Execute business logic with authenticated client
    const service = new DashboardService(authSupabase);
    const stats = await service.getDashboardStats(date_from, date_to);

    // Format response
    return new Response(JSON.stringify(successResponse(stats).body), {
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
