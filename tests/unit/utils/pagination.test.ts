/**
 * Pagination Utilities - Unit Tests
 *
 * Tests for pagination parameter parsing and calculation
 */

import { describe, it, expect } from "vitest";
import { parsePaginationParams } from "@/lib/utils/pagination";
import { PAGINATION_DEFAULTS } from "@/types";

describe("Pagination Utilities", () => {
  describe("parsePaginationParams", () => {
    it("should use default values when no parameters provided", () => {
      const result = parsePaginationParams({});

      expect(result.page).toBe(PAGINATION_DEFAULTS.PAGE);
      expect(result.limit).toBe(PAGINATION_DEFAULTS.LIMIT);
      expect(result.offset).toBe(0);
    });

    it("should parse valid page parameter", () => {
      const result = parsePaginationParams({ page: 2 });

      expect(result.page).toBe(2);
      expect(result.offset).toBe(20); // (2 - 1) * 20
    });

    it("should parse valid limit parameter", () => {
      const result = parsePaginationParams({ limit: 10 });

      expect(result.limit).toBe(10);
    });

    it("should calculate correct offset for page 1", () => {
      const result = parsePaginationParams({ page: 1, limit: 20 });

      expect(result.offset).toBe(0);
    });

    it("should calculate correct offset for page 2", () => {
      const result = parsePaginationParams({ page: 2, limit: 20 });

      expect(result.offset).toBe(20);
    });

    it("should calculate correct offset for page 3 with custom limit", () => {
      const result = parsePaginationParams({ page: 3, limit: 50 });

      expect(result.offset).toBe(100); // (3 - 1) * 50
    });

    it("should enforce minimum page of 1", () => {
      const result = parsePaginationParams({ page: 0 });

      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it("should enforce minimum page of 1 for negative values", () => {
      const result = parsePaginationParams({ page: -5 });

      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it("should enforce minimum limit of 1", () => {
      const result = parsePaginationParams({ limit: 0 });

      expect(result.limit).toBe(1);
    });

    it("should enforce minimum limit of 1 for negative values", () => {
      const result = parsePaginationParams({ limit: -10 });

      expect(result.limit).toBe(1);
    });

    it("should enforce maximum limit", () => {
      const result = parsePaginationParams({ limit: 200 });

      expect(result.limit).toBe(PAGINATION_DEFAULTS.MAX_LIMIT);
    });

    it("should handle maximum limit exactly", () => {
      const result = parsePaginationParams({
        limit: PAGINATION_DEFAULTS.MAX_LIMIT,
      });

      expect(result.limit).toBe(PAGINATION_DEFAULTS.MAX_LIMIT);
    });

    it("should handle limit just over maximum", () => {
      const result = parsePaginationParams({
        limit: PAGINATION_DEFAULTS.MAX_LIMIT + 1,
      });

      expect(result.limit).toBe(PAGINATION_DEFAULTS.MAX_LIMIT);
    });

    it("should handle both parameters together", () => {
      const result = parsePaginationParams({ page: 5, limit: 25 });

      expect(result.page).toBe(5);
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(100); // (5 - 1) * 25
    });

    it("should handle large page numbers", () => {
      const result = parsePaginationParams({ page: 100, limit: 20 });

      expect(result.page).toBe(100);
      expect(result.offset).toBe(1980); // (100 - 1) * 20
    });

    it("should handle edge case - page 1 with limit 1", () => {
      const result = parsePaginationParams({ page: 1, limit: 1 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.offset).toBe(0);
    });

    it("should handle undefined values explicitly", () => {
      const result = parsePaginationParams({
        page: undefined,
        limit: undefined,
      });

      expect(result.page).toBe(PAGINATION_DEFAULTS.PAGE);
      expect(result.limit).toBe(PAGINATION_DEFAULTS.LIMIT);
      expect(result.offset).toBe(0);
    });
  });

  describe("Offset Calculation Edge Cases", () => {
    it("should correctly calculate offset for various scenarios", () => {
      const scenarios = [
        { page: 1, limit: 10, expectedOffset: 0 },
        { page: 1, limit: 20, expectedOffset: 0 },
        { page: 2, limit: 10, expectedOffset: 10 },
        { page: 2, limit: 20, expectedOffset: 20 },
        { page: 3, limit: 10, expectedOffset: 20 },
        { page: 5, limit: 50, expectedOffset: 200 },
        { page: 10, limit: 100, expectedOffset: 900 },
      ];

      scenarios.forEach(({ page, limit, expectedOffset }) => {
        const result = parsePaginationParams({ page, limit });
        expect(result.offset).toBe(expectedOffset);
      });
    });
  });
});
