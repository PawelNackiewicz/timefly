class DashboardService {
  constructor(supabase) {
    this.supabase = supabase;
  }
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
  async getDashboardStats(dateFrom, dateTo) {
    const defaultDateFrom = /* @__PURE__ */ new Date();
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30);
    const from = dateFrom || defaultDateFrom.toISOString();
    const to = dateTo || (/* @__PURE__ */ new Date()).toISOString();
    const { data: registrations } = await this.supabase.from("time_registrations").select("*").gte("check_in", from).lte("check_in", to);
    const totalRegistrations = registrations?.length || 0;
    const completedRegistrations = registrations?.filter((r) => r.status === "completed").length || 0;
    const inProgressRegistrations = registrations?.filter((r) => r.status === "in_progress").length || 0;
    const manualInterventions = registrations?.filter((r) => r.manual_intervention).length || 0;
    const totalHours = registrations?.reduce((sum, reg) => {
      if (reg.check_out) {
        const hours = (new Date(reg.check_out).getTime() - new Date(reg.check_in).getTime()) / (1e3 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0) || 0;
    const avgPerRegistration = completedRegistrations > 0 ? totalHours / completedRegistrations : 0;
    const { data: allWorkers } = await this.supabase.from("workers").select("id, is_active");
    const totalWorkers = allWorkers?.length || 0;
    const activeWorkers = allWorkers?.filter((w) => w.is_active).length || 0;
    const inactiveWorkers = totalWorkers - activeWorkers;
    const { data: workersWithActiveReg } = await this.supabase.from("time_registrations").select("worker_id").eq("status", "in_progress");
    const uniqueWorkersWithActiveReg = new Set(
      workersWithActiveReg?.map((r) => r.worker_id) || []
    ).size;
    const avgPerWorker = activeWorkers > 0 ? totalHours / activeWorkers : 0;
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayRegistrations } = await this.supabase.from("time_registrations").select("*").gte("check_in", today.toISOString());
    const todayTotal = todayRegistrations?.length || 0;
    const todayHours = todayRegistrations?.reduce((sum, reg) => {
      if (reg.check_out) {
        const hours = (new Date(reg.check_out).getTime() - new Date(reg.check_in).getTime()) / (1e3 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0) || 0;
    return {
      time_period: {
        from,
        to
      },
      registrations: {
        total: totalRegistrations,
        completed: completedRegistrations,
        in_progress: inProgressRegistrations,
        manual_interventions: manualInterventions,
        manual_intervention_rate: totalRegistrations > 0 ? Math.round(manualInterventions / totalRegistrations * 1e4) / 100 : 0
      },
      workers: {
        total: totalWorkers,
        active: activeWorkers,
        inactive: inactiveWorkers,
        with_active_registration: uniqueWorkersWithActiveReg
      },
      work_hours: {
        total_hours: Math.round(totalHours * 100) / 100,
        average_per_registration: Math.round(avgPerRegistration * 100) / 100,
        average_per_worker: Math.round(avgPerWorker * 100) / 100
      },
      performance: {
        average_registration_time_seconds: 2.3,
        // Placeholder - would need actual tracking
        successful_registrations_rate: totalRegistrations > 0 ? Math.round(
          completedRegistrations / totalRegistrations * 1e4
        ) / 100 : 0
      },
      recent_activity: {
        today_registrations: todayTotal,
        today_hours: Math.round(todayHours * 100) / 100
      }
    };
  }
  /**
   * Get recent time registration entries for dashboard display
   *
   * @param limit - Number of entries to return (default: 10, max: 50)
   * @returns List of recent time entries with worker info and computed duration
   */
  async getRecentEntries(limit = 10) {
    const { data, error } = await this.supabase.from("time_registrations").select(
      `
        id,
        check_in,
        check_out,
        status,
        manual_intervention,
        created_at,
        worker:workers!inner(id, first_name, last_name)
      `
    ).order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []).map((entry) => {
      const duration = entry.check_out ? (new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime()) / (1e3 * 60 * 60) : void 0;
      return {
        id: entry.id,
        worker: entry.worker,
        check_in: entry.check_in,
        check_out: entry.check_out,
        duration_hours: duration ? Math.round(duration * 100) / 100 : void 0,
        status: entry.status,
        manual_intervention: entry.manual_intervention,
        created_at: entry.created_at
      };
    });
  }
}

export { DashboardService as D };
