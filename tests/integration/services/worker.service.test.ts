/**
 * Worker Service - Integration Tests
 *
 * Tests for WorkerService with mocked Supabase client
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkerService } from "@/lib/services/worker.service";
import { AppError } from "@/lib/utils/error-handler";
import { API_ERROR_CODES } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

// Mock the password utils
vi.mock("@/lib/utils/password", () => ({
  hashPin: vi.fn(async (pin: string) => `hashed_${pin}`),
  verifyPin: vi.fn(
    async (pin: string, hash: string) => hash === `hashed_${pin}`
  ),
}));

describe("WorkerService Integration Tests", () => {
  let service: WorkerService;
  let mockSupabase: any;

  beforeEach(() => {
    // Create mock Supabase client with chainable query methods
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    service = new WorkerService(mockSupabase);
  });

  describe("listWorkers", () => {
    it("should list workers with default pagination", async () => {
      const mockWorkers = [
        {
          id: "1",
          first_name: "Jan",
          last_name: "Kowalski",
          pin_hash: "hashed_1234",
          department: "IT",
          is_active: true,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "2",
          first_name: "Anna",
          last_name: "Nowak",
          pin_hash: "hashed_2222",
          department: "HR",
          is_active: true,
          created_at: "2025-01-02T00:00:00Z",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockWorkers,
            error: null,
            count: 2,
          }),
        }),
      });

      const result = await service.listWorkers({});

      expect(result.workers).toHaveLength(2);
      expect(result.workers[0]).not.toHaveProperty("pin_hash");
      expect(result.pagination.total_items).toBe(2);
    });

    it("should filter workers by search term", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
      });

      const result = await service.listWorkers({ search: "kowal" });

      expect(mockSupabase.from).toHaveBeenCalledWith("workers");
      expect(result.workers).toEqual([]);
    });

    it("should filter workers by department", async () => {
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

      await service.listWorkers({ department: "IT" });

      expect(mockSupabase.from).toHaveBeenCalledWith("workers");
    });

    it("should filter workers by is_active status", async () => {
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

      await service.listWorkers({ is_active: false });

      expect(mockSupabase.from).toHaveBeenCalledWith("workers");
    });

    it("should handle pagination parameters", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 50,
          }),
        }),
      });

      const result = await service.listWorkers({ page: 2, limit: 10 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe("getWorkerById", () => {
    it("should get worker with statistics", async () => {
      const mockWorker = {
        id: "1",
        first_name: "Jan",
        last_name: "Kowalski",
        pin_hash: "hashed_1234",
        department: "IT",
        is_active: true,
        created_at: "2025-01-01T00:00:00Z",
      };

      const mockRegistrations = [
        {
          check_in: "2025-01-20T08:00:00Z",
          check_out: "2025-01-20T16:00:00Z",
          status: "completed",
        },
        {
          check_in: "2025-01-21T08:00:00Z",
          check_out: "2025-01-21T17:00:00Z",
          status: "completed",
        },
      ];

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
                eq: vi.fn().mockResolvedValue({
                  data: mockRegistrations,
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const result = await service.getWorkerById("1");

      expect(result.id).toBe("1");
      expect(result).not.toHaveProperty("pin_hash");
      expect(result.stats.total_registrations).toBe(2);
      expect(result.stats.total_hours_worked).toBeGreaterThan(0);
    });

    it("should throw AppError when worker not found", async () => {
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

      await expect(service.getWorkerById("nonexistent")).rejects.toThrow(
        AppError
      );
      await expect(service.getWorkerById("nonexistent")).rejects.toThrow(
        "Worker not found"
      );
    });
  });

  describe("createWorker", () => {
    it("should create a worker with hashed PIN", async () => {
      const newWorker = {
        first_name: "Test",
        last_name: "Worker",
        pin: "1234",
        department: "IT",
        is_active: true,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "workers") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "1",
                    first_name: newWorker.first_name,
                    last_name: newWorker.last_name,
                    department: newWorker.department,
                    is_active: newWorker.is_active,
                    pin_hash: "hashed_1234",
                    created_at: "2025-01-01T00:00:00Z",
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const result = await service.createWorker(newWorker);

      expect(result.first_name).toBe("Test");
      expect(result.last_name).toBe("Worker");
      expect(result).not.toHaveProperty("pin_hash");
      expect(result).not.toHaveProperty("pin");
    });

    it("should allow creating workers with the same PIN", async () => {
      const newWorker = {
        first_name: "Test",
        last_name: "Worker",
        pin: "1234",
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "2",
                first_name: newWorker.first_name,
                last_name: newWorker.last_name,
                pin_hash: "hashed_1234",
                department: null,
                is_active: true,
                created_at: "2025-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createWorker(newWorker);

      expect(result.id).toBe("2");
      expect(result).not.toHaveProperty("pin_hash");
    });
  });

  describe("updateWorker", () => {
    it("should update worker information", async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "1" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "1",
                  first_name: "Updated",
                  last_name: "Name",
                  pin_hash: "hash",
                  department: "HR",
                  is_active: true,
                  created_at: "2025-01-01T00:00:00Z",
                },
                error: null,
              }),
            }),
          }),
        }),
      }));

      const result = await service.updateWorker("1", {
        first_name: "Updated",
        last_name: "Name",
      });

      expect(result.first_name).toBe("Updated");
      expect(result).not.toHaveProperty("pin_hash");
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
        service.updateWorker("nonexistent", { first_name: "Test" })
      ).rejects.toThrow("Worker not found");
    });
  });

  describe("updateWorkerPin", () => {
    it("should update worker PIN", async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "1" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }));

      await expect(service.updateWorkerPin("1", "5678")).resolves.not.toThrow();
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
        service.updateWorkerPin("nonexistent", "5678")
      ).rejects.toThrow("Worker not found");
    });

    it("should allow updating PIN to a value already in use by another worker", async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "1" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }));

      await expect(service.updateWorkerPin("1", "5678")).resolves.not.toThrow();
    });
  });

  describe("deactivateWorker", () => {
    it("should deactivate worker (soft delete)", async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "1" },
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(service.deactivateWorker("1")).resolves.not.toThrow();
    });

    it("should throw error when worker not found", async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
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

      await expect(service.deactivateWorker("nonexistent")).rejects.toThrow(
        "Worker not found"
      );
    });
  });
});
