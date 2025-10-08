/**
 * Dashboard Service
 *
 * Business logic layer for dashboard statistics and analytics
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { DashboardStatsDTO, RecentTimeEntryDTO } from "@/types";

/**
 * Dashboard Service class handling all dashboard-related operations
 */
export class DashboardService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get comprehensive dashboard statistics
   *
   * Calculates KPI metrics including:
   * - Registration statistics (total, completed, in_progress, manual interventions)
   * - Worker statistics (total, active, inactive, with active registration)
   * - Work hours statistics (total, averages)
   * - Performance metrics
   * - Recent activity (today's stats)
   *
   * @param dateFrom - Start date for statistics (default: 30 days ago)
   * @param dateTo - End date for statistics (default: today)
   * @returns Complete dashboard statistics
   */
  async getDashboardStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<DashboardStatsDTO> {
    // Default date range: last 30 days
    const defaultDateFrom = new Date();
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30);

    const from = dateFrom || defaultDateFrom.toISOString();
    const to = dateTo || new Date().toISOString();

    // Get all registrations in date range
    const { data: registrations } = await this.supabase
      .from("time_registrations")
      .select("*")
      .gte("check_in", from)
      .lte("check_in", to);

    const totalRegistrations = registrations?.length || 0;
    const completedRegistrations =
      registrations?.filter((r) => r.status === "completed").length || 0;
    const inProgressRegistrations =
      registrations?.filter((r) => r.status === "in_progress").length || 0;
    const manualInterventions =
      registrations?.filter((r) => r.manual_intervention).length || 0;

    // Calculate work hours
    const totalHours =
      registrations?.reduce((sum, reg) => {
        if (reg.check_out) {
          const hours =
            (new Date(reg.check_out).getTime() -
              new Date(reg.check_in).getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0) || 0;

    const avgPerRegistration =
      completedRegistrations > 0 ? totalHours / completedRegistrations : 0;

    // Get worker counts
    const { data: allWorkers } = await this.supabase
      .from("workers")
      .select("id, is_active");

    const totalWorkers = allWorkers?.length || 0;
    const activeWorkers = allWorkers?.filter((w) => w.is_active).length || 0;
    const inactiveWorkers = totalWorkers - activeWorkers;

    // Get workers with active registration
    const { data: workersWithActiveReg } = await this.supabase
      .from("time_registrations")
      .select("worker_id")
      .eq("status", "in_progress");

    const uniqueWorkersWithActiveReg = new Set(
      workersWithActiveReg?.map((r) => r.worker_id) || []
    ).size;

    const avgPerWorker = activeWorkers > 0 ? totalHours / activeWorkers : 0;

    // Get today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayRegistrations } = await this.supabase
      .from("time_registrations")
      .select("*")
      .gte("check_in", today.toISOString());

    const todayTotal = todayRegistrations?.length || 0;
    const todayHours =
      todayRegistrations?.reduce((sum, reg) => {
        if (reg.check_out) {
          const hours =
            (new Date(reg.check_out).getTime() -
              new Date(reg.check_in).getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0) || 0;

    return {
      time_period: {
        from,
        to,
      },
      registrations: {
        total: totalRegistrations,
        completed: completedRegistrations,
        in_progress: inProgressRegistrations,
        manual_interventions: manualInterventions,
        manual_intervention_rate:
          totalRegistrations > 0
            ? Math.round((manualInterventions / totalRegistrations) * 10000) /
              100
            : 0,
      },
      workers: {
        total: totalWorkers,
        active: activeWorkers,
        inactive: inactiveWorkers,
        with_active_registration: uniqueWorkersWithActiveReg,
      },
      work_hours: {
        total_hours: Math.round(totalHours * 100) / 100,
        average_per_registration: Math.round(avgPerRegistration * 100) / 100,
        average_per_worker: Math.round(avgPerWorker * 100) / 100,
      },
      performance: {
        average_registration_time_seconds: 2.3, // Placeholder - would need actual tracking
        successful_registrations_rate:
          totalRegistrations > 0
            ? Math.round(
                (completedRegistrations / totalRegistrations) * 10000
              ) / 100
            : 0,
      },
      recent_activity: {
        today_registrations: todayTotal,
        today_hours: Math.round(todayHours * 100) / 100,
      },
    };
  }

  /**
   * Get recent time registration entries for dashboard display
   *
   * @param limit - Number of entries to return (default: 10, max: 50)
   * @returns List of recent time entries with worker info and computed duration
   */
  async getRecentEntries(limit: number = 10): Promise<RecentTimeEntryDTO[]> {
    const { data, error } = await this.supabase
      .from("time_registrations")
      .select(
        `
        id,
        check_in,
        check_out,
        status,
        manual_intervention,
        created_at,
        worker:workers!inner(id, first_name, last_name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((entry) => {
      const duration = entry.check_out
        ? (new Date(entry.check_out).getTime() -
            new Date(entry.check_in).getTime()) /
          (1000 * 60 * 60)
        : undefined;

      return {
        id: entry.id,
        worker: entry.worker,
        check_in: entry.check_in,
        check_out: entry.check_out,
        duration_hours: duration ? Math.round(duration * 100) / 100 : undefined,
        status: entry.status,
        manual_intervention: entry.manual_intervention,
        created_at: entry.created_at,
      };
    });
  }
}
