/**
 * Error Handler Utilities - Unit Tests
 *
 * Tests for error handling and AppError class
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError, handleError } from "@/lib/utils/error-handler";
import { API_ERROR_CODES } from "@/types";
import { z } from "zod";

describe("Error Handler Utilities", () => {
  // Mock console.error to avoid noise in test output
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("AppError", () => {
    it("should create an AppError with all properties", () => {
      const error = new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Resource not found",
        { id: "Resource ID not found" }
      );

      expect(error.code).toBe(API_ERROR_CODES.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Resource not found");
      expect(error.details).toEqual({ id: "Resource ID not found" });
      expect(error.name).toBe("AppError");
    });

    it("should create an AppError without details", () => {
      const error = new AppError(
        API_ERROR_CODES.BAD_REQUEST,
        400,
        "Bad request"
      );

      expect(error.code).toBe(API_ERROR_CODES.BAD_REQUEST);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
      expect(error.details).toBeUndefined();
    });

    it("should be an instance of Error", () => {
      const error = new AppError(
        API_ERROR_CODES.INTERNAL_SERVER_ERROR,
        500,
        "Internal error"
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it("should have a stack trace", () => {
      const error = new AppError(
        API_ERROR_CODES.UNAUTHORIZED,
        401,
        "Unauthorized"
      );

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("AppError");
    });
  });

  describe("handleError", () => {
    it("should handle AppError correctly", () => {
      const appError = new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Worker not found"
      );

      const response = handleError(appError);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
      expect(response.body.error.message).toBe("Worker not found");
      expect(response.status).toBe(404);
    });

    it("should handle AppError with details", () => {
      const appError = new AppError(
        API_ERROR_CODES.UNPROCESSABLE_ENTITY,
        422,
        "Validation failed",
        { pin: "PIN must be 4-6 digits" }
      );

      const response = handleError(appError);

      expect(response.body.error.details).toEqual({
        pin: "PIN must be 4-6 digits",
      });
      expect(response.status).toBe(422);
    });

    it("should handle Zod validation errors", () => {
      const schema = z.object({
        pin: z.string().regex(/^\d{4,6}$/),
        name: z.string().min(1),
      });

      try {
        schema.parse({ pin: "123", name: "" });
      } catch (error) {
        const response = handleError(error);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe(
          API_ERROR_CODES.UNPROCESSABLE_ENTITY
        );
        expect(response.body.error.message).toBe("Validation failed");
        expect(response.body.error.details).toBeDefined();
        expect(response.status).toBe(422);
      }
    });

    it("should handle Supabase unique violation error (23505)", () => {
      const dbError = {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      };

      const response = handleError(dbError);

      expect(response.body.error.code).toBe(API_ERROR_CODES.CONFLICT);
      expect(response.body.error.message).toBe("Resource already exists");
      expect(response.status).toBe(409);
    });

    it("should handle Supabase foreign key violation error (23503)", () => {
      const dbError = {
        code: "23503",
        message: "foreign key violation",
      };

      const response = handleError(dbError);

      expect(response.body.error.code).toBe(API_ERROR_CODES.BAD_REQUEST);
      expect(response.body.error.message).toBe(
        "Referenced resource does not exist"
      );
      expect(response.status).toBe(400);
    });

    it("should handle PostgREST not found error (PGRST116)", () => {
      const dbError = {
        code: "PGRST116",
        message: "no rows returned",
      };

      const response = handleError(dbError);

      expect(response.body.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
      expect(response.body.error.message).toBe("Resource not found");
      expect(response.status).toBe(404);
    });

    it("should handle unknown database errors", () => {
      const dbError = {
        code: "UNKNOWN_CODE",
        message: "Unknown database error",
      };

      const response = handleError(dbError);

      expect(response.body.error.code).toBe(
        API_ERROR_CODES.INTERNAL_SERVER_ERROR
      );
      expect(response.body.error.message).toBe("An unexpected error occurred");
      expect(response.status).toBe(500);
    });

    it("should handle generic Error objects", () => {
      const error = new Error("Something went wrong");

      const response = handleError(error);

      expect(response.body.error.code).toBe(
        API_ERROR_CODES.INTERNAL_SERVER_ERROR
      );
      expect(response.body.error.message).toBe("An unexpected error occurred");
      expect(response.status).toBe(500);
    });

    it("should handle null errors", () => {
      const response = handleError(null);

      expect(response.body.error.code).toBe(
        API_ERROR_CODES.INTERNAL_SERVER_ERROR
      );
      expect(response.body.error.message).toBe("An unexpected error occurred");
      expect(response.status).toBe(500);
    });

    it("should handle undefined errors", () => {
      const response = handleError(undefined);

      expect(response.body.error.code).toBe(
        API_ERROR_CODES.INTERNAL_SERVER_ERROR
      );
      expect(response.body.error.message).toBe("An unexpected error occurred");
      expect(response.status).toBe(500);
    });

    it("should handle string errors", () => {
      const response = handleError("String error message");

      expect(response.body.error.code).toBe(
        API_ERROR_CODES.INTERNAL_SERVER_ERROR
      );
      expect(response.body.error.message).toBe("An unexpected error occurred");
      expect(response.status).toBe(500);
    });

    it("should log errors to console", () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const error = new Error("Test error");

      handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith("API Error:", error);
    });
  });

  describe("Error Response Format", () => {
    it("should return response with correct structure", () => {
      const appError = new AppError(
        API_ERROR_CODES.FORBIDDEN,
        403,
        "Access denied"
      );

      const response = handleError(appError);

      expect(response).toMatchObject({
        body: {
          success: false,
          error: {
            code: expect.any(String),
            message: expect.any(String),
          },
        },
        status: 403,
      });
    });

    it("should include details when available", () => {
      const appError = new AppError(
        API_ERROR_CODES.UNPROCESSABLE_ENTITY,
        422,
        "Validation failed",
        { field: "error message" }
      );

      const response = handleError(appError);

      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details).toEqual({ field: "error message" });
      expect(response.status).toBe(422);
    });
  });
});
