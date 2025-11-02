/**
 * Time Registration Service
 *
 * Business logic layer for time registration operations
 * Handles both worker (PIN-based) and admin operations
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type {
  TimeRegistrationToggleResponseData,
  CreateTimeRegistrationCommand,
  UpdateTimeRegistrationCommand,
  ListTimeRegistrationsQueryParams,
} from "@/types";
import { API_ERROR_CODES } from "@/types";
import { verifyPin } from "../utils/password";
import { AppError } from "../utils/error-handler";
import { parsePaginationParams } from "../utils/pagination";

/**
 * Time Registration Service class handling all time registration operations
 */
export class TimeRegistrationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Toggle check-in/check-out for a worker using PIN authentication
   *
   * Automatically determines whether to check-in or check-out based on current state:
   * - If no active registration exists → Check-in (create new registration)
   * - If active registration exists → Check-out (update with check_out time)
   *
   * Note: Multiple workers can share the same PIN. If multiple workers have the same PIN,
   * the first matching worker found in the database will be used for the registration.
   *
   * @param pin - Worker's 4-6 digit PIN
   * @returns Action taken (check_in/check_out), registration data, and worker info
   * @throws AppError if PIN is invalid, worker inactive, or database error
   */
  async toggleCheckInOut(
    pin: string
  ): Promise<TimeRegistrationToggleResponseData> {
    // Find all workers (need to verify PIN against hashes)
    // Note: Using service role client to bypass RLS for PIN verification
    const { data: workers } = await this.supabase
      .from("workers")
      .select("id, first_name, last_name, pin_hash, is_active");

    if (!workers || workers.length === 0) {
      throw new AppError(API_ERROR_CODES.UNAUTHORIZED, 401, "Invalid PIN");
    }

    // Verify PIN against all worker hashes
    // If multiple workers have the same PIN, the first match will be used
    let worker = null;
    for (const w of workers) {
      if (await verifyPin(pin, w.pin_hash)) {
        worker = w;
        break;
      }
    }

    if (!worker) {
      throw new AppError(API_ERROR_CODES.UNAUTHORIZED, 401, "Invalid PIN");
    }

    // Check if worker is active
    if (!worker.is_active) {
      throw new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Worker not found or inactive"
      );
    }

    // Check for existing active registration
    const { data: activeRegistration } = await this.supabase
      .from("time_registrations")
      .select("*")
      .eq("worker_id", worker.id)
      .eq("status", "in_progress")
      .single();

    if (activeRegistration) {
      // CHECK-OUT: Update existing registration
      const checkOutTime = new Date().toISOString();
      const { data, error } = await this.supabase
        .from("time_registrations")
        .update({
          check_out: checkOutTime,
          status: "completed",
        })
        .eq("id", activeRegistration.id)
        .select()
        .single();

      if (error) throw error;

      // Calculate duration in hours
      const durationHours =
        (new Date(checkOutTime).getTime() - new Date(data.check_in).getTime()) /
        (1000 * 60 * 60);

      return {
        action: "check_out",
        registration: {
          id: data.id,
          worker_id: data.worker_id,
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          manual_intervention: data.manual_intervention,
          duration_hours: Math.round(durationHours * 100) / 100,
        },
        worker: {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name,
        },
      };
    } else {
      // CHECK-IN: Create new registration
      const { data, error } = await this.supabase
        .from("time_registrations")
        .insert({
          worker_id: worker.id,
          check_in: new Date().toISOString(),
          status: "in_progress",
          manual_intervention: false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        action: "check_in",
        registration: {
          id: data.id,
          worker_id: data.worker_id,
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          manual_intervention: data.manual_intervention,
        },
        worker: {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name,
        },
      };
    }
  }

  /**
   * List time registrations with filtering, sorting, and pagination (Admin only)
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of time registrations with worker details
   */
  async listTimeRegistrations(params: ListTimeRegistrationsQueryParams) {
    const { page, limit, offset } = parsePaginationParams(params);
    const sortBy = params.sort_by || "check_in";
    const sortOrder = params.sort_order || "desc";

    let query = this.supabase.from("time_registrations").select(
      `
        *,
        worker:workers!inner(id, first_name, last_name, department)
      `,
      { count: "exact" }
    );

    // Apply filters
    if (params.worker_id) {
      query = query.eq("worker_id", params.worker_id);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.manual_intervention !== undefined) {
      query = query.eq("manual_intervention", params.manual_intervention);
    }

    if (params.date_from) {
      query = query.gte("check_in", params.date_from);
    }

    if (params.date_to) {
      query = query.lte("check_in", params.date_to);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Format response with computed duration
    const registrations = (data || []).map((reg) => {
      const duration = reg.check_out
        ? (new Date(reg.check_out).getTime() -
            new Date(reg.check_in).getTime()) /
          (1000 * 60 * 60)
        : undefined;

      return {
        ...reg,
        duration_hours: duration ? Math.round(duration * 100) / 100 : undefined,
      };
    });

    return {
      registrations,
      pagination: {
        page,
        limit,
        total_items: count || 0,
      },
    };
  }

  /**
   * Get time registration by ID with full details (Admin only)
   *
   * @param id - Registration UUID
   * @returns Time registration with worker and admin details
   * @throws AppError if registration not found
   */
  async getTimeRegistrationById(id: string) {
    const { data, error } = await this.supabase
      .from("time_registrations")
      .select(
        `
        *,
        worker:workers!inner(id, first_name, last_name, department),
        modified_by_admin:admins(id, first_name, last_name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError(
          API_ERROR_CODES.NOT_FOUND,
          404,
          "Registration not found"
        );
      }
      throw error;
    }

    // Calculate duration if completed
    const duration = data.check_out
      ? (new Date(data.check_out).getTime() -
          new Date(data.check_in).getTime()) /
        (1000 * 60 * 60)
      : undefined;

    return {
      ...data,
      duration_hours: duration ? Math.round(duration * 100) / 100 : undefined,
    };
  }

  /**
   * Create time registration manually (Admin only)
   *
   * @param command - Registration creation data
   * @param adminId - ID of admin creating the registration
   * @returns Created registration
   * @throws AppError if worker not found, inactive, or already has active registration
   */
  async createTimeRegistration(
    command: CreateTimeRegistrationCommand,
    adminId: string
  ) {
    // Verify worker exists and is active
    const { data: worker, error: workerError } = await this.supabase
      .from("workers")
      .select("id, is_active")
      .eq("id", command.worker_id)
      .single();

    if (workerError || !worker) {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
    }

    if (!worker.is_active) {
      throw new AppError(
        API_ERROR_CODES.BAD_REQUEST,
        400,
        "Worker is not active"
      );
    }

    // Check for existing in_progress registration
    const { data: activeReg } = await this.supabase
      .from("time_registrations")
      .select("id")
      .eq("worker_id", command.worker_id)
      .eq("status", "in_progress")
      .single();

    if (activeReg) {
      throw new AppError(
        API_ERROR_CODES.CONFLICT,
        409,
        "Worker already has an active registration"
      );
    }

    // Validate timestamp is not in the future
    if (new Date(command.check_in) > new Date()) {
      throw new AppError(
        API_ERROR_CODES.BAD_REQUEST,
        400,
        "Check-in time cannot be in the future"
      );
    }

    // Create registration with manual intervention flag
    const { data, error } = await this.supabase
      .from("time_registrations")
      .insert({
        worker_id: command.worker_id,
        check_in: command.check_in,
        status: "in_progress",
        manual_intervention: true,
        modified_by_admin_id: adminId,
        notes: command.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Update time registration (Admin only)
   *
   * @param id - Registration UUID
   * @param command - Fields to update
   * @param adminId - ID of admin updating the registration
   * @returns Updated registration with computed duration
   * @throws AppError if registration not found or validation fails
   */
  async updateTimeRegistration(
    id: string,
    command: UpdateTimeRegistrationCommand,
    adminId: string
  ) {
    // Get existing registration
    const { data: existing, error: fetchError } = await this.supabase
      .from("time_registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Registration not found"
      );
    }

    // Validate check_out > check_in constraint
    const checkIn = command.check_in
      ? new Date(command.check_in)
      : new Date(existing.check_in);
    const checkOut = command.check_out
      ? new Date(command.check_out)
      : existing.check_out
      ? new Date(existing.check_out)
      : null;

    if (checkOut && checkOut <= checkIn) {
      throw new AppError(
        API_ERROR_CODES.BAD_REQUEST,
        400,
        "Check-out time must be after check-in time"
      );
    }

    // Auto-complete status if check_out is provided
    let status = command.status;
    if (command.check_out && !status) {
      status = "completed";
    }

    // Update with manual intervention flag
    const updateData: any = {
      ...command,
      ...(status && { status }),
      manual_intervention: true,
      modified_by_admin_id: adminId,
    };

    const { data, error } = await this.supabase
      .from("time_registrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Calculate duration if completed
    const duration = data.check_out
      ? (new Date(data.check_out).getTime() -
          new Date(data.check_in).getTime()) /
        (1000 * 60 * 60)
      : undefined;

    return {
      ...data,
      duration_hours: duration ? Math.round(duration * 100) / 100 : undefined,
    };
  }

  /**
   * Delete time registration (Admin only)
   *
   * @param id - Registration UUID
   * @throws AppError if registration not found
   */
  async deleteTimeRegistration(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("time_registrations")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError(
          API_ERROR_CODES.NOT_FOUND,
          404,
          "Registration not found"
        );
      }
      throw error;
    }
  }
}
