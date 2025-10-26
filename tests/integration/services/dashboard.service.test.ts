/**
 * Dashboard Service - Integration Tests
 *
 * Tests for DashboardService with mocked Supabase client
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "@/lib/services/dashboard.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

describe("DashboardService Integration Tests", () => {
  let service: DashboardService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient<Database>;

    service = new DashboardService(mockSupabase);
  });

  describe("getDashboardStats", () => {
    it("should calculate dashboard statistics", async () => {
      const mockRegistrations = [
        {
          id: "reg-1",
          worker_id: "worker-1",
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
          status: "completed",
          manual_intervention: false,
          created_at: "2025-01-20T08:00:00Z",
        },
        {
          id: "reg-2",
          worker_id: "worker-2",
          check_in: "2025-01-20T09:00:00Z",
          check_out: "2025-01-20T17:00:00Z",
          status: "completed",
          manual_intervention: true,
          created_at: "2025-01-20T09:00:00Z",
        },
        {
          id: "reg-3",
          worker_id: "worker-3",
          check_in: "2025-01-20T10:00:00Z",
          check_out: null,
          status: "in_progress",
          manual_intervention: false,
          created_at: "2025-01-20T10:00:00Z",
        },
      ];

      const mockWorkers = [
        { id: "worker-1", is_active: true },
        { id: "worker-2", is_active: true },
        { id: "worker-3", is_active: true },
        { id: "worker-4", is_active: false },
      ];

      const mockActiveRegistrations = [{ worker_id: "worker-3" }];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({
                  data: mockRegistrations,
                  error: null,
                }),
              }),
              eq: vi.fn().mockResolvedValue({
                data: mockActiveRegistrations,
                error: null,
              }),
            }),
          };
        } else if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: mockWorkers,
              error: null,
            }),
          };
        }
      });

      const result = await service.getDashboardStats(
        "2025-01-01T00:00:00Z",
        "2025-01-31T23:59:59Z"
      );

      expect(result.time_period.from).toBe("2025-01-01T00:00:00Z");
      expect(result.time_period.to).toBe("2025-01-31T23:59:59Z");
      expect(result.registrations.total).toBe(3);
      expect(result.registrations.completed).toBe(2);
      expect(result.registrations.in_progress).toBe(1);
      expect(result.registrations.manual_interventions).toBe(1);
      expect(result.registrations.manual_intervention_rate).toBeGreaterThan(0);
      expect(result.workers.total).toBe(4);
      expect(result.workers.active).toBe(3);
      expect(result.workers.inactive).toBe(1);
      expect(result.workers.with_active_registration).toBe(1);
      expect(result.work_hours.total_hours).toBeGreaterThan(0);
      expect(result.work_hours.average_per_registration).toBeGreaterThan(0);
    });

    it("should use default date range when not provided", async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        } else if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
      });

      const result = await service.getDashboardStats();

      expect(result.time_period.from).toBeDefined();
      expect(result.time_period.to).toBeDefined();
    });

    it("should handle empty data gracefully", async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        } else if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
      });

      const result = await service.getDashboardStats();

      expect(result.registrations.total).toBe(0);
      expect(result.workers.total).toBe(0);
      expect(result.work_hours.total_hours).toBe(0);
      expect(result.work_hours.average_per_registration).toBe(0);
    });

    it("should calculate manual intervention rate correctly", async () => {
      const mockRegistrations = [
        {
          status: "completed",
          manual_intervention: true,
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
        },
        {
          status: "completed",
          manual_intervention: true,
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
        },
        {
          status: "completed",
          manual_intervention: false,
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
        },
        {
          status: "completed",
          manual_intervention: false,
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({
                  data: mockRegistrations,
                  error: null,
                }),
              }),
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        } else if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
      });

      const result = await service.getDashboardStats();

      // 2 out of 4 registrations have manual intervention = 50%
      expect(result.registrations.manual_intervention_rate).toBe(50);
    });

    it("should calculate work hours correctly", async () => {
      const mockRegistrations = [
        {
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z", // 8 hours
          status: "completed",
          manual_intervention: false,
        },
        {
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T12:00:00Z", // 4 hours
          status: "completed",
          manual_intervention: false,
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({
                  data: mockRegistrations,
                  error: null,
                }),
              }),
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        } else if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ id: "worker-1", is_active: true }],
              error: null,
            }),
          };
        }
      });

      const result = await service.getDashboardStats();

      expect(result.work_hours.total_hours).toBe(12); // 8 + 4
      expect(result.work_hours.average_per_registration).toBe(6); // 12 / 2
    });

    it("should calculate today activity correctly", async () => {
      const today = new Date();
      today.setHours(8, 0, 0, 0);

      const todayRegistrations = [
        {
          check_in: today.toISOString(),
          check_out: new Date(
            today.getTime() + 8 * 60 * 60 * 1000
          ).toISOString(),
          status: "completed",
          manual_intervention: false,
        },
      ];

      // Track call count to differentiate between queries
      let gteCallCount = 0;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockImplementation(() => {
                gteCallCount++;
                // First call: main date range query (with .lte())
                if (gteCallCount === 1) {
                  return {
                    lte: vi.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  };
                }
                // Second call: today's query (no .lte(), returns directly)
                return Promise.resolve({
                  data: todayRegistrations,
                  error: null,
                });
              }),
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        } else if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
      });

      const result = await service.getDashboardStats();

      expect(result.recent_activity.today_registrations).toBe(1);
      expect(result.recent_activity.today_hours).toBe(8);
    });
  });

  describe("getRecentEntries", () => {
    it("should get recent entries with default limit", async () => {
      const mockEntries = [
        {
          id: "reg-1",
          check_in: "2025-01-20T10:00:00Z",
          check_out: "2025-01-20T18:00:00Z",
          status: "completed",
          manual_intervention: false,
          created_at: "2025-01-20T10:00:00Z",
          worker: {
            id: "worker-1",
            first_name: "Jan",
            last_name: "Kowalski",
          },
        },
        {
          id: "reg-2",
          check_in: "2025-01-20T09:00:00Z",
          check_out: null,
          status: "in_progress",
          manual_intervention: false,
          created_at: "2025-01-20T09:00:00Z",
          worker: {
            id: "worker-2",
            first_name: "Anna",
            last_name: "Nowak",
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockEntries,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRecentEntries();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("reg-1");
      expect(result[0].duration_hours).toBeDefined();
      expect(result[1].duration_hours).toBeUndefined(); // In progress
    });

    it("should respect custom limit", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      await service.getRecentEntries(25);

      const limitCall = mockSupabase.from().select().order().limit;
      expect(limitCall).toHaveBeenCalledWith(25);
    });

    it("should order by created_at descending", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      await service.getRecentEntries();

      const orderCall = mockSupabase.from().select().order;
      expect(orderCall).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("should calculate duration_hours correctly", async () => {
      const mockEntries = [
        {
          id: "reg-1",
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z", // 8 hours
          status: "completed",
          manual_intervention: false,
          created_at: "2025-01-20T08:00:00Z",
          worker: { id: "worker-1", first_name: "Jan", last_name: "Kowalski" },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockEntries,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRecentEntries();

      expect(result[0].duration_hours).toBe(8);
    });

    it("should handle empty results", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRecentEntries();

      expect(result).toEqual([]);
    });

    it("should include worker information", async () => {
      const mockEntries = [
        {
          id: "reg-1",
          check_in: "2025-01-20T08:00:00Z",
          check_out: null,
          status: "in_progress",
          manual_intervention: false,
          created_at: "2025-01-20T08:00:00Z",
          worker: {
            id: "worker-1",
            first_name: "Jan",
            last_name: "Kowalski",
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockEntries,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getRecentEntries();

      expect(result[0].worker).toBeDefined();
      expect(result[0].worker.first_name).toBe("Jan");
      expect(result[0].worker.last_name).toBe("Kowalski");
    });
  });
});
