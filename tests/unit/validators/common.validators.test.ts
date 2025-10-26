/**
 * Common Validators - Unit Tests
 *
 * Tests for shared Zod validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  uuidSchema,
  pinSchema,
  paginationSchema,
  sortOrderSchema,
  isoDateSchema,
} from "@/lib/validators/common.validators";

describe("Common Validators", () => {
  describe("uuidSchema", () => {
    it("should validate valid UUID v4", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = uuidSchema.safeParse(validUuid);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it("should reject invalid UUID format", () => {
      const result = uuidSchema.safeParse("not-a-uuid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("Invalid UUID format");
      }
    });

    it("should reject UUID with missing hyphens", () => {
      const result = uuidSchema.safeParse("550e8400e29b41d4a716446655440000");

      expect(result.success).toBe(false);
    });

    it("should reject partial UUID", () => {
      const result = uuidSchema.safeParse("550e8400-e29b-41d4");

      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = uuidSchema.safeParse("");

      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = uuidSchema.safeParse(null);

      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = uuidSchema.safeParse(undefined);

      expect(result.success).toBe(false);
    });
  });

  describe("pinSchema", () => {
    it("should validate 4-digit PIN", () => {
      const result = pinSchema.safeParse("1234");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("1234");
      }
    });

    it("should validate 5-digit PIN", () => {
      const result = pinSchema.safeParse("12345");

      expect(result.success).toBe(true);
    });

    it("should validate 6-digit PIN", () => {
      const result = pinSchema.safeParse("123456");

      expect(result.success).toBe(true);
    });

    it("should reject 3-digit PIN", () => {
      const result = pinSchema.safeParse("123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "PIN must be 4-6 digits"
        );
      }
    });

    it("should reject 7-digit PIN", () => {
      const result = pinSchema.safeParse("1234567");

      expect(result.success).toBe(false);
    });

    it("should reject PIN with letters", () => {
      const result = pinSchema.safeParse("12a4");

      expect(result.success).toBe(false);
    });

    it("should reject PIN with special characters", () => {
      const result = pinSchema.safeParse("12-4");

      expect(result.success).toBe(false);
    });

    it("should reject PIN with spaces", () => {
      const result = pinSchema.safeParse("12 34");

      expect(result.success).toBe(false);
    });

    it("should reject empty PIN", () => {
      const result = pinSchema.safeParse("");

      expect(result.success).toBe(false);
    });

    it("should accept PIN with leading zeros", () => {
      const result = pinSchema.safeParse("0001");

      expect(result.success).toBe(true);
    });
  });

  describe("paginationSchema", () => {
    it("should parse valid pagination parameters", () => {
      const result = paginationSchema.safeParse({ page: "2", limit: "20" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should coerce string numbers to integers", () => {
      const result = paginationSchema.safeParse({ page: "5", limit: "50" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe("number");
        expect(typeof result.data.limit).toBe("number");
      }
    });

    it("should accept missing page parameter", () => {
      const result = paginationSchema.safeParse({ limit: "20" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBeUndefined();
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept missing limit parameter", () => {
      const result = paginationSchema.safeParse({ page: "2" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBeUndefined();
      }
    });

    it("should accept empty object", () => {
      const result = paginationSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should reject negative page", () => {
      const result = paginationSchema.safeParse({ page: "-1" });

      expect(result.success).toBe(false);
    });

    it("should reject zero page", () => {
      const result = paginationSchema.safeParse({ page: "0" });

      expect(result.success).toBe(false);
    });

    it("should reject negative limit", () => {
      const result = paginationSchema.safeParse({ limit: "-10" });

      expect(result.success).toBe(false);
    });

    it("should reject zero limit", () => {
      const result = paginationSchema.safeParse({ limit: "0" });

      expect(result.success).toBe(false);
    });

    it("should reject limit over 100", () => {
      const result = paginationSchema.safeParse({ limit: "101" });

      expect(result.success).toBe(false);
    });

    it("should accept limit of exactly 100", () => {
      const result = paginationSchema.safeParse({ limit: "100" });

      expect(result.success).toBe(true);
    });

    it("should reject non-integer page", () => {
      const result = paginationSchema.safeParse({ page: "2.5" });

      expect(result.success).toBe(false);
    });

    it("should reject non-integer limit", () => {
      const result = paginationSchema.safeParse({ limit: "20.5" });

      expect(result.success).toBe(false);
    });
  });

  describe("sortOrderSchema", () => {
    it('should validate "asc"', () => {
      const result = sortOrderSchema.safeParse("asc");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("asc");
      }
    });

    it('should validate "desc"', () => {
      const result = sortOrderSchema.safeParse("desc");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("desc");
      }
    });

    it("should accept undefined (optional)", () => {
      const result = sortOrderSchema.safeParse(undefined);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it("should reject invalid sort order", () => {
      const result = sortOrderSchema.safeParse("ascending");

      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = sortOrderSchema.safeParse("");

      expect(result.success).toBe(false);
    });

    it("should be case-sensitive", () => {
      const result = sortOrderSchema.safeParse("ASC");

      expect(result.success).toBe(false);
    });
  });

  describe("isoDateSchema", () => {
    it("should validate ISO 8601 datetime with timezone", () => {
      const result = isoDateSchema.safeParse("2025-01-20T10:00:00Z");

      expect(result.success).toBe(true);
    });

    it("should validate ISO datetime with milliseconds", () => {
      const result = isoDateSchema.safeParse("2025-01-20T10:00:00.123Z");

      expect(result.success).toBe(true);
    });

    it("should validate ISO datetime with timezone offset", () => {
      const result = isoDateSchema.safeParse("2025-01-20T10:00:00+01:00");

      expect(result.success).toBe(true);
    });

    it("should reject date without time", () => {
      const result = isoDateSchema.safeParse("2025-01-20");

      expect(result.success).toBe(false);
    });

    it("should reject datetime without timezone", () => {
      const result = isoDateSchema.safeParse("2025-01-20T10:00:00");

      expect(result.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const result = isoDateSchema.safeParse("20/01/2025 10:00:00");

      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = isoDateSchema.safeParse("");

      expect(result.success).toBe(false);
    });

    it("should validate current timestamp", () => {
      const now = new Date().toISOString();
      const result = isoDateSchema.safeParse(now);

      expect(result.success).toBe(true);
    });
  });
});
