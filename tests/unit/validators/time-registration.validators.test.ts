/**
 * Time Registration Validators - Unit Tests
 *
 * Tests for time registration and dashboard validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  toggleTimeRegistrationSchema,
  listTimeRegistrationsQuerySchema,
  timeRegistrationIdParamSchema,
  createTimeRegistrationSchema,
  updateTimeRegistrationSchema,
  dashboardStatsQuerySchema,
  recentEntriesQuerySchema,
} from "@/lib/validators/time-registration.validators";

describe("Time Registration Validators", () => {
  describe("toggleTimeRegistrationSchema", () => {
    it("should validate valid PIN", () => {
      const result = toggleTimeRegistrationSchema.safeParse({ pin: "1234" });

      expect(result.success).toBe(true);
    });

    it("should reject invalid PIN", () => {
      const result = toggleTimeRegistrationSchema.safeParse({ pin: "123" });

      expect(result.success).toBe(false);
    });

    it("should reject missing PIN", () => {
      const result = toggleTimeRegistrationSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("listTimeRegistrationsQuerySchema", () => {
    it("should validate all query parameters", () => {
      const result = listTimeRegistrationsQuerySchema.safeParse({
        worker_id: "550e8400-e29b-41d4-a716-446655440000",
        status: "completed",
        manual_intervention: "true",
        date_from: "2025-01-01",
        date_to: "2025-01-31",
        page: "1",
        limit: "20",
        sort_by: "check_in",
        sort_order: "desc",
      });

      expect(result.success).toBe(true);
    });

    it("should accept empty query", () => {
      const result = listTimeRegistrationsQuerySchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should validate status enum", () => {
      const result1 = listTimeRegistrationsQuerySchema.safeParse({
        status: "in_progress",
      });
      const result2 = listTimeRegistrationsQuerySchema.safeParse({
        status: "completed",
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = listTimeRegistrationsQuerySchema.safeParse({
        status: "pending",
      });

      expect(result.success).toBe(false);
    });

    it("should coerce manual_intervention to boolean", () => {
      const result = listTimeRegistrationsQuerySchema.safeParse({
        manual_intervention: "true",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.manual_intervention).toBe(true);
      }
    });

    it("should validate sort_by options", () => {
      const validOptions = ["check_in", "check_out", "created_at"];

      validOptions.forEach((sortBy) => {
        const result = listTimeRegistrationsQuerySchema.safeParse({
          sort_by: sortBy,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid sort_by", () => {
      const result = listTimeRegistrationsQuerySchema.safeParse({
        sort_by: "worker_id",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid worker_id UUID", () => {
      const result = listTimeRegistrationsQuerySchema.safeParse({
        worker_id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("timeRegistrationIdParamSchema", () => {
    it("should validate valid UUID", () => {
      const result = timeRegistrationIdParamSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = timeRegistrationIdParamSchema.safeParse({
        id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("createTimeRegistrationSchema", () => {
    it("should validate valid creation data", () => {
      const result = createTimeRegistrationSchema.safeParse({
        worker_id: "550e8400-e29b-41d4-a716-446655440000",
        check_in: "2025-01-20T08:00:00Z",
        notes: "Forgot to check in",
      });

      expect(result.success).toBe(true);
    });

    it("should accept without notes", () => {
      const result = createTimeRegistrationSchema.safeParse({
        worker_id: "550e8400-e29b-41d4-a716-446655440000",
        check_in: "2025-01-20T08:00:00Z",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid worker_id", () => {
      const result = createTimeRegistrationSchema.safeParse({
        worker_id: "not-a-uuid",
        check_in: "2025-01-20T08:00:00Z",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid ISO date", () => {
      const result = createTimeRegistrationSchema.safeParse({
        worker_id: "550e8400-e29b-41d4-a716-446655440000",
        check_in: "2025-01-20 08:00:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject notes too long", () => {
      const longNotes = "a".repeat(1001);
      const result = createTimeRegistrationSchema.safeParse({
        worker_id: "550e8400-e29b-41d4-a716-446655440000",
        check_in: "2025-01-20T08:00:00Z",
        notes: longNotes,
      });

      expect(result.success).toBe(false);
    });

    it("should accept notes at max length", () => {
      const notes = "a".repeat(1000);
      const result = createTimeRegistrationSchema.safeParse({
        worker_id: "550e8400-e29b-41d4-a716-446655440000",
        check_in: "2025-01-20T08:00:00Z",
        notes,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("updateTimeRegistrationSchema", () => {
    it("should validate partial update with one field", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        notes: "Updated notes",
      });

      expect(result.success).toBe(true);
    });

    it("should validate update with multiple fields", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        check_in: "2025-01-20T08:00:00Z",
        check_out: "2025-01-20T16:00:00Z",
        status: "completed",
      });

      expect(result.success).toBe(true);
    });

    it("should enforce check_out after check_in constraint", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        check_in: "2025-01-20T16:00:00Z",
        check_out: "2025-01-20T08:00:00Z", // before check_in
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "check_out must be after check_in"
        );
      }
    });

    it("should accept check_out after check_in", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        check_in: "2025-01-20T08:00:00Z",
        check_out: "2025-01-20T16:00:00Z",
      });

      expect(result.success).toBe(true);
    });

    it("should accept check_in update alone", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        check_in: "2025-01-20T08:00:00Z",
      });

      expect(result.success).toBe(true);
    });

    it("should accept check_out update alone", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        check_out: "2025-01-20T16:00:00Z",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty object (no fields)", () => {
      const result = updateTimeRegistrationSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "At least one field must be provided for update"
        );
      }
    });

    it("should validate status enum", () => {
      const result1 = updateTimeRegistrationSchema.safeParse({
        status: "in_progress",
      });
      const result2 = updateTimeRegistrationSchema.safeParse({
        status: "completed",
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = updateTimeRegistrationSchema.safeParse({
        status: "pending",
      });

      expect(result.success).toBe(false);
    });

    it("should reject notes too long", () => {
      const longNotes = "a".repeat(1001);
      const result = updateTimeRegistrationSchema.safeParse({
        notes: longNotes,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("dashboardStatsQuerySchema", () => {
    it("should validate date range", () => {
      const result = dashboardStatsQuerySchema.safeParse({
        date_from: "2025-01-01",
        date_to: "2025-01-31",
      });

      expect(result.success).toBe(true);
    });

    it("should accept empty query", () => {
      const result = dashboardStatsQuerySchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should accept only date_from", () => {
      const result = dashboardStatsQuerySchema.safeParse({
        date_from: "2025-01-01",
      });

      expect(result.success).toBe(true);
    });

    it("should accept only date_to", () => {
      const result = dashboardStatsQuerySchema.safeParse({
        date_to: "2025-01-31",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("recentEntriesQuerySchema", () => {
    it("should validate valid limit", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "10" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
      }
    });

    it("should coerce string to number", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "25" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.limit).toBe("number");
      }
    });

    it("should accept empty query", () => {
      const result = recentEntriesQuerySchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should reject limit over 50", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "51" });

      expect(result.success).toBe(false);
    });

    it("should accept limit of exactly 50", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "50" });

      expect(result.success).toBe(true);
    });

    it("should reject limit of 0", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "0" });

      expect(result.success).toBe(false);
    });

    it("should reject negative limit", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "-5" });

      expect(result.success).toBe(false);
    });

    it("should reject non-integer limit", () => {
      const result = recentEntriesQuerySchema.safeParse({ limit: "10.5" });

      expect(result.success).toBe(false);
    });
  });
});
