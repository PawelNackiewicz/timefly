import { z } from 'zod';

const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
};
const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
};

function successResponse(data, message, status = 200) {
  return {
    body: {
      success: true,
      data,
      ...message && { message }
    },
    status
  };
}
function errorResponse(code, message, status, details) {
  return {
    body: {
      success: false,
      error: {
        code,
        message,
        ...details && { details }
      }
    },
    status
  };
}
function paginationMetadata(page, limit, totalItems) {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    total_items: totalItems,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_previous: page > 1
  };
}

class AppError extends Error {
  constructor(code, statusCode, message, details) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    this.name = "AppError";
    Error.captureStackTrace?.(this, AppError);
  }
}
function handleError(error) {
  console.error("API Error:", error);
  if (error instanceof AppError) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    );
  }
  if (error instanceof z.ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const field = err.path.join(".");
      acc[field] = err.message;
      return acc;
    }, {});
    return errorResponse(
      API_ERROR_CODES.UNPROCESSABLE_ENTITY,
      "Validation failed",
      422,
      details
    );
  }
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error;
    switch (supabaseError.code) {
      case "23505":
        return errorResponse(
          API_ERROR_CODES.CONFLICT,
          "Resource already exists",
          409
        );
      case "23503":
        return errorResponse(
          API_ERROR_CODES.BAD_REQUEST,
          "Referenced resource does not exist",
          400
        );
      case "PGRST116":
        return errorResponse(
          API_ERROR_CODES.NOT_FOUND,
          "Resource not found",
          404
        );
      default:
        console.error("Unhandled database error:", supabaseError);
        break;
    }
  }
  return errorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
    500
  );
}

export { AppError as A, PAGINATION_DEFAULTS as P, API_ERROR_CODES as a, handleError as h, paginationMetadata as p, successResponse as s };
