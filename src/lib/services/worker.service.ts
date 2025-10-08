/**
 * Worker Service
 *
 * Business logic layer for worker management operations
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type {
  WorkerDTO,
  WorkerWithStatsDTO,
  CreateWorkerCommand,
  UpdateWorkerCommand,
  ListWorkersQueryParams,
} from "@/types";
import { API_ERROR_CODES } from "@/types";
import { parsePaginationParams } from "../utils/pagination";
import { hashPin } from "../utils/password";
import { AppError } from "../utils/error-handler";

/**
 * Worker Service class handling all worker-related business logic
 */
export class WorkerService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * List workers with filtering, sorting, and pagination
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of workers with metadata
   */
  async listWorkers(params: ListWorkersQueryParams) {
    const { page, limit, offset } = parsePaginationParams(params);
    const sortBy = params.sort_by || "last_name";
    const sortOrder = params.sort_order || "asc";

    let query = this.supabase.from("workers").select("*", { count: "exact" });

    // Apply filters
    if (params.search) {
      query = query.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
      );
    }

    if (params.department) {
      query = query.eq("department", params.department);
    }

    if (params.is_active !== undefined) {
      query = query.eq("is_active", params.is_active);
    } else {
      // Default: show only active workers
      query = query.eq("is_active", true);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Remove pin_hash from response for security
    const workers: WorkerDTO[] = (data || []).map(
      ({ pin_hash, ...worker }) => worker
    );

    return {
      workers,
      pagination: {
        page,
        limit,
        total_items: count || 0,
      },
    };
  }

  /**
   * Get worker by ID with statistics
   *
   * @param id - Worker UUID
   * @returns Worker details with computed statistics
   * @throws AppError if worker not found
   */
  async getWorkerById(id: string): Promise<WorkerWithStatsDTO> {
    // Get worker data
    const { data: worker, error } = await this.supabase
      .from("workers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
      }
      throw error;
    }

    // Calculate statistics from time registrations
    const { data: stats } = await this.supabase
      .from("time_registrations")
      .select("check_in, check_out, status")
      .eq("worker_id", id)
      .eq("status", "completed");

    const totalRegistrations = stats?.length || 0;
    const totalHoursWorked =
      stats?.reduce((sum, reg) => {
        if (reg.check_out) {
          const hours =
            (new Date(reg.check_out).getTime() -
              new Date(reg.check_in).getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0) || 0;

    const averageDailyHours =
      totalRegistrations > 0 ? totalHoursWorked / totalRegistrations : 0;

    // Remove pin_hash from response
    const { pin_hash, ...workerData } = worker;

    return {
      ...workerData,
      stats: {
        total_registrations: totalRegistrations,
        total_hours_worked: Math.round(totalHoursWorked * 100) / 100,
        average_daily_hours: Math.round(averageDailyHours * 100) / 100,
      },
    };
  }

  /**
   * Create a new worker
   *
   * @param command - Worker creation data with plain-text PIN
   * @returns Created worker (without PIN hash)
   * @throws AppError if PIN already exists
   */
  async createWorker(command: CreateWorkerCommand): Promise<WorkerDTO> {
    // Hash the PIN
    const pinHash = await hashPin(command.pin);

    // Check if PIN already exists (bcrypt hashes are unique per salt, so we need to check all)
    // Note: In production, consider implementing a unique constraint on a deterministic hash
    const { data: existingWorkers } = await this.supabase
      .from("workers")
      .select("id, pin_hash");

    if (existingWorkers) {
      for (const existingWorker of existingWorkers) {
        const { verifyPin } = await import("../utils/password");
        if (await verifyPin(command.pin, existingWorker.pin_hash)) {
          throw new AppError(
            API_ERROR_CODES.CONFLICT,
            409,
            "PIN already exists"
          );
        }
      }
    }

    // Create worker
    const { data, error } = await this.supabase
      .from("workers")
      .insert({
        first_name: command.first_name,
        last_name: command.last_name,
        pin_hash: pinHash,
        department: command.department || null,
        is_active: command.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    // Remove pin_hash from response
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
  async updateWorker(
    id: string,
    command: UpdateWorkerCommand
  ): Promise<WorkerDTO> {
    // Check if worker exists
    const { data: existingWorker, error: checkError } = await this.supabase
      .from("workers")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingWorker) {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
    }

    // Update worker
    const { data, error } = await this.supabase
      .from("workers")
      .update(command)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Remove pin_hash from response
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
  async updateWorkerPin(id: string, newPin: string): Promise<void> {
    // Check if worker exists
    const { data: existingWorker, error: checkError } = await this.supabase
      .from("workers")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingWorker) {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
    }

    // Hash new PIN
    const pinHash = await hashPin(newPin);

    // Check if new PIN already exists (for different worker)
    const { data: allWorkers } = await this.supabase
      .from("workers")
      .select("id, pin_hash")
      .neq("id", id);

    if (allWorkers) {
      const { verifyPin } = await import("../utils/password");
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

    // Update PIN
    const { error } = await this.supabase
      .from("workers")
      .update({ pin_hash: pinHash })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Deactivate worker (soft delete)
   *
   * @param id - Worker UUID
   * @throws AppError if worker not found
   */
  async deactivateWorker(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("workers")
      .update({ is_active: false })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, "Worker not found");
      }
      throw error;
    }
  }
}
