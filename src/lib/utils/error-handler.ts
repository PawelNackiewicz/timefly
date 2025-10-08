/**
 * Error Handler Utilities
 *
 * Centralized error handling and logging for consistent error responses
 */

import { API_ERROR_CODES } from "@/types";
import { errorResponse } from "./api-response";
import { z } from "zod";

/**
 * Custom application error class for controlled error handling
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public message: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, AppError);
  }
}

/**
 * Central error handler that converts various error types into standardized API responses
 *
 * @param error - Any error thrown during request processing
 * @returns Formatted error response with appropriate status code
 */
export function handleError(error: unknown) {
  // Log error for debugging (in production, send to monitoring service)
  console.error("API Error:", error);

  // Handle custom AppError instances
  if (error instanceof AppError) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    );
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const field = err.path.join(".");
      acc[field] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return errorResponse(
      API_ERROR_CODES.UNPROCESSABLE_ENTITY,
      "Validation failed",
      422,
      details
    );
  }

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as { code: string; message: string };

    // Map specific database error codes to HTTP responses
    switch (supabaseError.code) {
      case "23505": // Unique violation
        return errorResponse(
          API_ERROR_CODES.CONFLICT,
          "Resource already exists",
          409
        );

      case "23503": // Foreign key violation
        return errorResponse(
          API_ERROR_CODES.BAD_REQUEST,
          "Referenced resource does not exist",
          400
        );

      case "PGRST116": // PostgREST: no rows returned (not found)
        return errorResponse(
          API_ERROR_CODES.NOT_FOUND,
          "Resource not found",
          404
        );

      default:
        // Log unhandled database error for investigation
        console.error("Unhandled database error:", supabaseError);
        break;
    }
  }

  // Default error response for unexpected errors
  return errorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
    500
  );
}
