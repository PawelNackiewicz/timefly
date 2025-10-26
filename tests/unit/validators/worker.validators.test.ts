/**
 * Worker Validators - Unit Tests
 *
 * Tests for worker-related Zod validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  listWorkersQuerySchema,
  workerIdParamSchema,
  createWorkerSchema,
  updateWorkerSchema,
  updateWorkerPinSchema,
} from "@/lib/validators/worker.validators";

describe("Worker Validators", () => {
  describe("listWorkersQuerySchema", () => {
    it("should validate valid query parameters", () => {
      const result = listWorkersQuerySchema.safeParse({
        search: "kowal",
        department: "IT",
        is_active: "true",
        page: "1",
        limit: "20",
        sort_by: "last_name",
        sort_order: "asc",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("kowal");
        expect(result.data.department).toBe("IT");
        expect(result.data.is_active).toBe(true);
      }
    });

    it("should accept empty query parameters", () => {
      const result = listWorkersQuerySchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should coerce is_active to boolean", () => {
      const result1 = listWorkersQuerySchema.safeParse({ is_active: "true" });
      const result2 = listWorkersQuerySchema.safeParse({ is_active: "false" });
      const result3 = listWorkersQuerySchema.safeParse({ is_active: "1" });
      const result4 = listWorkersQuerySchema.safeParse({ is_active: "0" });

      expect(result1.success && result1.data.is_active).toBe(true);
      expect(result2.success && result2.data.is_active).toBe(false);
      expect(result3.success && result3.data.is_active).toBe(true);
      expect(result4.success && result4.data.is_active).toBe(false);
    });

    it("should reject search string too long", () => {
      const longString = "a".repeat(201);
      const result = listWorkersQuerySchema.safeParse({ search: longString });

      expect(result.success).toBe(false);
    });

    it("should reject department too long", () => {
      const longString = "a".repeat(101);
      const result = listWorkersQuerySchema.safeParse({
        department: longString,
      });

      expect(result.success).toBe(false);
    });

    it("should validate sort_by options", () => {
      const validOptions = ["first_name", "last_name", "created_at"];

      validOptions.forEach((sortBy) => {
        const result = listWorkersQuerySchema.safeParse({ sort_by: sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid sort_by", () => {
      const result = listWorkersQuerySchema.safeParse({
        sort_by: "department",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("workerIdParamSchema", () => {
    it("should validate valid UUID", () => {
      const result = workerIdParamSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = workerIdParamSchema.safeParse({ id: "not-a-uuid" });

      expect(result.success).toBe(false);
    });

    it("should reject missing id", () => {
      const result = workerIdParamSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("createWorkerSchema", () => {
    it("should validate valid worker creation data", () => {
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "Kowalski",
        pin: "1234",
        department: "IT",
        is_active: true,
      });

      expect(result.success).toBe(true);
    });

    it("should accept optional fields as undefined", () => {
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "Kowalski",
        pin: "1234",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.department).toBeUndefined();
        expect(result.data.is_active).toBeUndefined();
      }
    });

    it("should accept department as null", () => {
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "Kowalski",
        pin: "1234",
        department: null,
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty first_name", () => {
      const result = createWorkerSchema.safeParse({
        first_name: "",
        last_name: "Kowalski",
        pin: "1234",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "First name is required"
        );
      }
    });

    it("should reject empty last_name", () => {
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "",
        pin: "1234",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "Last name is required"
        );
      }
    });

    it("should reject first_name too long", () => {
      const longName = "a".repeat(101);
      const result = createWorkerSchema.safeParse({
        first_name: longName,
        last_name: "Kowalski",
        pin: "1234",
      });

      expect(result.success).toBe(false);
    });

    it("should reject last_name too long", () => {
      const longName = "a".repeat(101);
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: longName,
        pin: "1234",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid PIN format", () => {
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "Kowalski",
        pin: "123", // too short
      });

      expect(result.success).toBe(false);
    });

    it("should accept all valid PIN formats", () => {
      const pins = ["1234", "12345", "123456"];

      pins.forEach((pin) => {
        const result = createWorkerSchema.safeParse({
          first_name: "Jan",
          last_name: "Kowalski",
          pin,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject department too long", () => {
      const longDept = "a".repeat(101);
      const result = createWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "Kowalski",
        pin: "1234",
        department: longDept,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateWorkerSchema", () => {
    it("should validate partial update with one field", () => {
      const result = updateWorkerSchema.safeParse({
        first_name: "Jan",
      });

      expect(result.success).toBe(true);
    });

    it("should validate partial update with multiple fields", () => {
      const result = updateWorkerSchema.safeParse({
        first_name: "Jan",
        last_name: "Kowalski",
        department: "HR",
      });

      expect(result.success).toBe(true);
    });

    it("should accept is_active update", () => {
      const result = updateWorkerSchema.safeParse({
        is_active: false,
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty object (no fields provided)", () => {
      const result = updateWorkerSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "At least one field must be provided for update"
        );
      }
    });

    it("should reject empty first_name", () => {
      const result = updateWorkerSchema.safeParse({
        first_name: "",
      });

      expect(result.success).toBe(false);
    });

    it("should reject field too long", () => {
      const longName = "a".repeat(101);
      const result = updateWorkerSchema.safeParse({
        first_name: longName,
      });

      expect(result.success).toBe(false);
    });

    it("should accept department as null", () => {
      const result = updateWorkerSchema.safeParse({
        department: null,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("updateWorkerPinSchema", () => {
    it("should validate valid PIN update", () => {
      const result = updateWorkerPinSchema.safeParse({
        new_pin: "5678",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid PIN", () => {
      const result = updateWorkerPinSchema.safeParse({
        new_pin: "123", // too short
      });

      expect(result.success).toBe(false);
    });

    it("should reject missing new_pin", () => {
      const result = updateWorkerPinSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("should accept all valid PIN lengths", () => {
      const pins = ["1234", "12345", "123456"];

      pins.forEach((pin) => {
        const result = updateWorkerPinSchema.safeParse({ new_pin: pin });
        expect(result.success).toBe(true);
      });
    });
  });
});
