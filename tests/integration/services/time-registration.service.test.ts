/**
 * Time Registration Service - Integration Tests
 *
 * Tests for TimeRegistrationService with mocked Supabase client
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import { AppError } from "@/lib/utils/error-handler";
import { API_ERROR_CODES } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

// Mock the password utils
vi.mock("@/lib/utils/password", () => ({
  verifyPin: vi.fn(
    async (pin: string, hash: string) => hash === `hashed_${pin}`
  ),
}));

describe("TimeRegistrationService Integration Tests", () => {
  let service: TimeRegistrationService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    service = new TimeRegistrationService(mockSupabase);
  });

  describe("toggleCheckInOut", () => {
    it("should perform check-in when no active registration exists", async () => {
      const mockWorker = {
        id: "worker-1",
        first_name: "Jan",
        last_name: "Kowalski",
        pin_hash: "hashed_1234",
        is_active: true,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [mockWorker],
              error: null,
            }),
          };
        } else if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null, // No active registration
                    error: null,
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "reg-1",
                    worker_id: "worker-1",
                    check_in: new Date().toISOString(),
                    check_out: null,
                    status: "in_progress",
                    manual_intervention: false,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const result = await service.toggleCheckInOut("1234");

      expect(result.action).toBe("check_in");
      expect(result.registration.status).toBe("in_progress");
      expect(result.worker.id).toBe("worker-1");
    });

    it("should perform check-out when active registration exists", async () => {
      const mockWorker = {
        id: "worker-1",
        first_name: "Jan",
        last_name: "Kowalski",
        pin_hash: "hashed_1234",
        is_active: true,
      };

      const mockActiveReg = {
        id: "reg-1",
        worker_id: "worker-1",
        check_in: "2025-01-20T08:00:00Z",
        check_out: null,
        status: "in_progress",
        manual_intervention: false,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "workers") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [mockWorker],
              error: null,
            }),
          };
        } else if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockActiveReg,
                    error: null,
                  }),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      ...mockActiveReg,
                      check_out: new Date().toISOString(),
                      status: "completed",
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
      });

      const result = await service.toggleCheckInOut("1234");

      expect(result.action).toBe("check_out");
      expect(result.registration.status).toBe("completed");
      expect(result.registration.duration_hours).toBeDefined();
    });

    it("should throw error for invalid PIN", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            {
              id: "worker-1",
              pin_hash: "hashed_1234",
              is_active: true,
            },
          ],
          error: null,
        }),
      });

      await expect(service.toggleCheckInOut("9999")).rejects.toThrow(
        "Invalid PIN"
      );
    });

    it("should throw error for inactive worker", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            {
              id: "worker-1",
              pin_hash: "hashed_1234",
              is_active: false, // Inactive
            },
          ],
          error: null,
        }),
      });

      await expect(service.toggleCheckInOut("1234")).rejects.toThrow(
        "Worker not found or inactive"
      );
    });

    it("should throw error when no workers exist", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      await expect(service.toggleCheckInOut("1234")).rejects.toThrow(
        "Invalid PIN"
      );
    });
  });

  describe("listTimeRegistrations", () => {
    it("should list time registrations with default pagination", async () => {
      const mockRegistrations = [
        {
          id: "reg-1",
          worker_id: "worker-1",
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
          status: "completed",
          manual_intervention: false,
          worker: {
            id: "worker-1",
            first_name: "Jan",
            last_name: "Kowalski",
            department: "IT",
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockRegistrations,
            error: null,
            count: 1,
          }),
        }),
      });

      const result = await service.listTimeRegistrations({});

      expect(result.registrations).toHaveLength(1);
      expect(result.registrations[0].duration_hours).toBeDefined();
      expect(result.pagination.total_items).toBe(1);
    });

    it("should filter by worker_id", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
      });

      await service.listTimeRegistrations({ worker_id: "worker-1" });

      expect(mockSupabase.from).toHaveBeenCalledWith("time_registrations");
    });

    it("should filter by status", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
      });

      await service.listTimeRegistrations({ status: "completed" });

      expect(mockSupabase.from).toHaveBeenCalledWith("time_registrations");
    });

    it("should filter by date range", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
      });

      await service.listTimeRegistrations({
        date_from: "2025-01-01",
        date_to: "2025-01-31",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("time_registrations");
    });
  });

  describe("getTimeRegistrationById", () => {
    it("should get time registration by ID", async () => {
      const mockReg = {
        id: "reg-1",
        worker_id: "worker-1",
        check_in: "2025-01-20T08:00:00Z",
        check_out: "2025-01-20T16:00:00Z",
        status: "completed",
        manual_intervention: false,
        worker: {
          id: "worker-1",
          first_name: "Jan",
          last_name: "Kowalski",
          department: "IT",
        },
        modified_by_admin: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockReg,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getTimeRegistrationById("reg-1");

      expect(result.id).toBe("reg-1");
      expect(result.duration_hours).toBeDefined();
    });

    it("should throw error when registration not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      await expect(
        service.getTimeRegistrationById("nonexistent")
      ).rejects.toThrow("Registration not found");
    });
  });

  describe("createTimeRegistration", () => {
    it("should create manual time registration", async () => {
      const mockWorker = {
        id: "worker-1",
        is_active: true,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "workers") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockWorker,
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null, // No active registration
                    error: null,
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "reg-1",
                    worker_id: "worker-1",
                    check_in: "2025-01-20T08:00:00Z",
                    status: "in_progress",
                    manual_intervention: true,
                    modified_by_admin_id: "admin-1",
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const result = await service.createTimeRegistration(
        {
          worker_id: "worker-1",
          check_in: "2025-01-20T08:00:00Z",
          notes: "Forgot to check in",
        },
        "admin-1"
      );

      expect(result.manual_intervention).toBe(true);
      expect(result.modified_by_admin_id).toBe("admin-1");
    });

    it("should throw error when worker not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      await expect(
        service.createTimeRegistration(
          {
            worker_id: "nonexistent",
            check_in: "2025-01-20T08:00:00Z",
          },
          "admin-1"
        )
      ).rejects.toThrow("Worker not found");
    });

    it("should throw error when worker is inactive", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "worker-1", is_active: false },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.createTimeRegistration(
          {
            worker_id: "worker-1",
            check_in: "2025-01-20T08:00:00Z",
          },
          "admin-1"
        )
      ).rejects.toThrow("Worker is not active");
    });

    it("should throw error when worker already has active registration", async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "workers") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "worker-1", is_active: true },
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: "reg-1" }, // Active registration exists
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
      });

      await expect(
        service.createTimeRegistration(
          {
            worker_id: "worker-1",
            check_in: "2025-01-20T08:00:00Z",
          },
          "admin-1"
        )
      ).rejects.toThrow("Worker already has an active registration");
    });

    it("should throw error when check-in time is in the future", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "workers") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "worker-1", is_active: true },
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === "time_registrations") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
      });

      await expect(
        service.createTimeRegistration(
          {
            worker_id: "worker-1",
            check_in: futureDate.toISOString(),
          },
          "admin-1"
        )
      ).rejects.toThrow("Check-in time cannot be in the future");
    });
  });

  describe("updateTimeRegistration", () => {
    it("should update time registration", async () => {
      const mockExisting = {
        id: "reg-1",
        worker_id: "worker-1",
        check_in: "2025-01-20T08:00:00Z",
        check_out: null,
        status: "in_progress",
      };

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExisting,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  ...mockExisting,
                  check_out: "2025-01-20T16:00:00Z",
                  status: "completed",
                  manual_intervention: true,
                  modified_by_admin_id: "admin-1",
                },
                error: null,
              }),
            }),
          }),
        }),
      }));

      const result = await service.updateTimeRegistration(
        "reg-1",
        {
          check_out: "2025-01-20T16:00:00Z",
        },
        "admin-1"
      );

      expect(result.status).toBe("completed");
      expect(result.manual_intervention).toBe(true);
      expect(result.duration_hours).toBeDefined();
    });

    it("should throw error when registration not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      await expect(
        service.updateTimeRegistration(
          "nonexistent",
          { notes: "Test" },
          "admin-1"
        )
      ).rejects.toThrow("Registration not found");
    });

    it("should throw error when check_out is before check_in", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "reg-1",
                check_in: "2025-01-20T08:00:00Z",
                check_out: null,
                status: "in_progress",
              },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.updateTimeRegistration(
          "reg-1",
          {
            check_out: "2025-01-20T07:00:00Z", // Before check_in
          },
          "admin-1"
        )
      ).rejects.toThrow("Check-out time must be after check-in time");
    });
  });

  describe("deleteTimeRegistration", () => {
    it("should delete time registration", async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "reg-1" },
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(
        service.deleteTimeRegistration("reg-1")
      ).resolves.not.toThrow();
    });

    it("should throw error when registration not found", async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.deleteTimeRegistration("nonexistent")
      ).rejects.toThrow("Registration not found");
    });
  });
});
