import { A as AppError, a as API_ERROR_CODES } from './error-handler_KWzIATZF.mjs';
import { v as verifyPin, p as parsePaginationParams } from './pagination_CcikHYZR.mjs';

class TimeRegistrationService {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * Toggle check-in/check-out for a worker using PIN authentication
   *
   * Automatically determines whether to check-in or check-out based on current state:
   * - If no active registration exists → Check-in (create new registration)
   * - If active registration exists → Check-out (update with check_out time)
   *
   * @param pin - Worker's 4-6 digit PIN
   * @returns Action taken (check_in/check_out), registration data, and worker info
   * @throws AppError if PIN is invalid, worker inactive, or database error
   */
  async toggleCheckInOut(pin) {
    const { data: workers } = await this.supabase.from("workers").select("id, first_name, last_name, pin_hash, is_active");
    if (!workers || workers.length === 0) {
      throw new AppError(API_ERROR_CODES.UNAUTHORIZED, 401, "Invalid PIN");
    }
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
    if (!worker.is_active) {
      throw new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Worker not found or inactive"
      );
    }
    const { data: activeRegistration } = await this.supabase.from("time_registrations").select("*").eq("worker_id", worker.id).eq("status", "in_progress").single();
    if (activeRegistration) {
      const checkOutTime = (/* @__PURE__ */ new Date()).toISOString();
      const { data, error } = await this.supabase.from("time_registrations").update({
        check_out: checkOutTime,
        status: "completed"
      }).eq("id", activeRegistration.id).select().single();
      if (error) throw error;
      const durationHours = (new Date(checkOutTime).getTime() - new Date(data.check_in).getTime()) / (1e3 * 60 * 60);
      return {
        action: "check_out",
        registration: {
          id: data.id,
          worker_id: data.worker_id,
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          manual_intervention: data.manual_intervention,
          duration_hours: Math.round(durationHours * 100) / 100
        },
        worker: {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name
        }
      };
    } else {
      const { data, error } = await this.supabase.from("time_registrations").insert({
        worker_id: worker.id,
        check_in: (/* @__PURE__ */ new Date()).toISOString(),
        status: "in_progress",
        manual_intervention: false
      }).select().single();
      if (error) throw error;
      return {
        action: "check_in",
        registration: {
          id: data.id,
          worker_id: data.worker_id,
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          manual_intervention: data.manual_intervention
        },
        worker: {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name
        }
      };
    }
  }
  /**
   * List time registrations with filtering, sorting, and pagination (Admin only)
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of time registrations with worker details
   */
  async listTimeRegistrations(params) {
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
    if (params.worker_id) {
      query = query.eq("worker_id", params.worker_id);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.manual_intervention !== void 0) {
      query = query.eq("manual_intervention", params.manual_intervention);
    }
    if (params.date_from) {
      query = query.gte("check_in", params.date_from);
    }
    if (params.date_to) {
      query = query.lte("check_in", params.date_to);
    }
    query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    const registrations = (data || []).map((reg) => {
      const duration = reg.check_out ? (new Date(reg.check_out).getTime() - new Date(reg.check_in).getTime()) / (1e3 * 60 * 60) : void 0;
      return {
        ...reg,
        duration_hours: duration ? Math.round(duration * 100) / 100 : void 0
      };
    });
    return {
      registrations,
      pagination: {
        page,
        limit,
        total_items: count || 0
      }
    };
  }
  /**
   * Get time registration by ID with full details (Admin only)
   *
   * @param id - Registration UUID
   * @returns Time registration with worker and admin details
   * @throws AppError if registration not found
   */
  async getTimeRegistrationById(id) {
    const { data, error } = await this.supabase.from("time_registrations").select(
      `
        *,
        worker:workers!inner(id, first_name, last_name, department),
        modified_by_admin:admins(id, first_name, last_name)
      `
    ).eq("id", id).single();
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
    const duration = data.check_out ? (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / (1e3 * 60 * 60) : void 0;
    return {
      ...data,
      duration_hours: duration ? Math.round(duration * 100) / 100 : void 0
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
  async createTimeRegistration(command, adminId) {
    const { data: worker, error: workerError } = await this.supabase.from("workers").select("id, is_active").eq("id", command.worker_id).single();
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
    const { data: activeReg } = await this.supabase.from("time_registrations").select("id").eq("worker_id", command.worker_id).eq("status", "in_progress").single();
    if (activeReg) {
      throw new AppError(
        API_ERROR_CODES.CONFLICT,
        409,
        "Worker already has an active registration"
      );
    }
    if (new Date(command.check_in) > /* @__PURE__ */ new Date()) {
      throw new AppError(
        API_ERROR_CODES.BAD_REQUEST,
        400,
        "Check-in time cannot be in the future"
      );
    }
    const { data, error } = await this.supabase.from("time_registrations").insert({
      worker_id: command.worker_id,
      check_in: command.check_in,
      status: "in_progress",
      manual_intervention: true,
      modified_by_admin_id: adminId,
      notes: command.notes || null
    }).select().single();
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
  async updateTimeRegistration(id, command, adminId) {
    const { data: existing, error: fetchError } = await this.supabase.from("time_registrations").select("*").eq("id", id).single();
    if (fetchError || !existing) {
      throw new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Registration not found"
      );
    }
    const checkIn = command.check_in ? new Date(command.check_in) : new Date(existing.check_in);
    const checkOut = command.check_out ? new Date(command.check_out) : existing.check_out ? new Date(existing.check_out) : null;
    if (checkOut && checkOut <= checkIn) {
      throw new AppError(
        API_ERROR_CODES.BAD_REQUEST,
        400,
        "Check-out time must be after check-in time"
      );
    }
    let status = command.status;
    if (command.check_out && !status) {
      status = "completed";
    }
    const updateData = {
      ...command,
      ...status && { status },
      manual_intervention: true,
      modified_by_admin_id: adminId
    };
    const { data, error } = await this.supabase.from("time_registrations").update(updateData).eq("id", id).select().single();
    if (error) throw error;
    const duration = data.check_out ? (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / (1e3 * 60 * 60) : void 0;
    return {
      ...data,
      duration_hours: duration ? Math.round(duration * 100) / 100 : void 0
    };
  }
  /**
   * Delete time registration (Admin only)
   *
   * @param id - Registration UUID
   * @throws AppError if registration not found
   */
  async deleteTimeRegistration(id) {
    const { data, error } = await this.supabase.from("time_registrations").delete().eq("id", id).select("id").single();
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

export { TimeRegistrationService as T };
