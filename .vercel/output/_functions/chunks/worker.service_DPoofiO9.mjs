import { A as AppError, a as API_ERROR_CODES } from './error-handler_KWzIATZF.mjs';
import { p as parsePaginationParams, h as hashPin } from './pagination_CcikHYZR.mjs';

class WorkerService {
  constructor(supabase) {
    this.supabase = supabase;
  }
  /**
   * List workers with filtering, sorting, and pagination
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of workers with metadata
   */
  async listWorkers(params) {
    const { page, limit, offset } = parsePaginationParams(params);
    const sortBy = params.sort_by || "last_name";
    const sortOrder = params.sort_order || "asc";
    let query = this.supabase.from("workers").select("*", { count: "exact" });
    if (params.search) {
      query = query.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
      );
    }
    if (params.department) {
      query = query.eq("department", params.department);
    }
    if (params.is_active !== void 0) {
      query = query.eq("is_active", params.is_active);
    } else {
      query = query.eq("is_active", true);
    }
    query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    const workers = (data || []).map(
      ({ pin_hash, ...worker }) => worker
    );
    return {
      workers,
      pagination: {
        page,
        limit,
        total_items: count || 0
      }
    };
  }
  /**
   * Get worker by ID with statistics
   *
   * @param id - Worker UUID
   * @returns Worker details with computed statistics
   * @throws AppError if worker not found
   */
  async getWorkerById(id) {
    const { data: worker, error } = await this.supabase.from("workers").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
      }
      throw error;
    }
    const { data: stats } = await this.supabase.from("time_registrations").select("check_in, check_out, status").eq("worker_id", id).eq("status", "completed");
    const totalRegistrations = stats?.length || 0;
    const totalHoursWorked = stats?.reduce((sum, reg) => {
      if (reg.check_out) {
        const hours = (new Date(reg.check_out).getTime() - new Date(reg.check_in).getTime()) / (1e3 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0) || 0;
    const averageDailyHours = totalRegistrations > 0 ? totalHoursWorked / totalRegistrations : 0;
    const { pin_hash, ...workerData } = worker;
    return {
      ...workerData,
      stats: {
        total_registrations: totalRegistrations,
        total_hours_worked: Math.round(totalHoursWorked * 100) / 100,
        average_daily_hours: Math.round(averageDailyHours * 100) / 100
      }
    };
  }
  /**
   * Create a new worker
   *
   * @param command - Worker creation data with plain-text PIN
   * @returns Created worker (without PIN hash)
   * @throws AppError if PIN already exists
   */
  async createWorker(command) {
    const pinHash = await hashPin(command.pin);
    const { data: existingWorkers } = await this.supabase.from("workers").select("id, pin_hash");
    if (existingWorkers) {
      for (const existingWorker of existingWorkers) {
        const { verifyPin } = await import('./pagination_CcikHYZR.mjs').then(n => n.a);
        if (await verifyPin(command.pin, existingWorker.pin_hash)) {
          throw new AppError(
            API_ERROR_CODES.CONFLICT,
            409,
            "PIN already exists"
          );
        }
      }
    }
    const { data, error } = await this.supabase.from("workers").insert({
      first_name: command.first_name,
      last_name: command.last_name,
      pin_hash: pinHash,
      department: command.department || null,
      is_active: command.is_active ?? true
    }).select().single();
    if (error) throw error;
    const { pin_hash: _, ...worker } = data;
    return worker;
  }
  /**
   * Update worker information (excluding PIN)
   *
   * @param id - Worker UUID
   * @param command - Fields to update
   * @returns Updated worker
   * @throws AppError if worker not found
   */
  async updateWorker(id, command) {
    const { data: existingWorker, error: checkError } = await this.supabase.from("workers").select("id").eq("id", id).single();
    if (checkError || !existingWorker) {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
    }
    const { data, error } = await this.supabase.from("workers").update(command).eq("id", id).select().single();
    if (error) throw error;
    const { pin_hash, ...worker } = data;
    return worker;
  }
  /**
   * Update worker's PIN
   *
   * @param id - Worker UUID
   * @param newPin - New plain-text PIN
   * @throws AppError if worker not found or PIN already in use
   */
  async updateWorkerPin(id, newPin) {
    const { data: existingWorker, error: checkError } = await this.supabase.from("workers").select("id").eq("id", id).single();
    if (checkError || !existingWorker) {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
    }
    const pinHash = await hashPin(newPin);
    const { data: allWorkers } = await this.supabase.from("workers").select("id, pin_hash").neq("id", id);
    if (allWorkers) {
      const { verifyPin } = await import('./pagination_CcikHYZR.mjs').then(n => n.a);
      for (const worker of allWorkers) {
        if (await verifyPin(newPin, worker.pin_hash)) {
          throw new AppError(
            API_ERROR_CODES.CONFLICT,
            409,
            "PIN already in use"
          );
        }
      }
    }
    const { error } = await this.supabase.from("workers").update({ pin_hash: pinHash }).eq("id", id);
    if (error) throw error;
  }
  /**
   * Deactivate worker (soft delete)
   *
   * @param id - Worker UUID
   * @throws AppError if worker not found
   */
  async deactivateWorker(id) {
    const { data, error } = await this.supabase.from("workers").update({ is_active: false }).eq("id", id).select("id").single();
    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
      }
      throw error;
    }
  }
}

export { WorkerService as W };
