/**
 * TimeFly API Types - DTOs and Command Models
 *
 * This file contains all Data Transfer Object (DTO) and Command Model types
 * used by the TimeFly REST API. All types are derived from the database schema
 * definitions to ensure type safety and consistency.
 */

import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// =============================================================================
// BASE ENTITY TYPES (derived from database schema)
// =============================================================================

/**
 * Worker entity from database (includes pin_hash - internal use only)
 */
type WorkerEntity = Tables<"workers">;

/**
 * Time Registration entity from database
 */
type TimeRegistrationEntity = Tables<"time_registrations">;

/**
 * Admin entity from database
 */
type AdminEntity = Tables<"admins">;

// =============================================================================
// WORKER DTOs
// =============================================================================

/**
 * Worker DTO for API responses
 * Excludes sensitive pin_hash field for security
 */
export type WorkerDTO = Omit<WorkerEntity, "pin_hash">;

/**
 * Worker summary DTO - minimal worker information for nested responses
 * Used in time registration responses and dashboard entries
 */
export type WorkerSummaryDTO = Pick<
  WorkerDTO,
  "id" | "first_name" | "last_name"
>;

/**
 * Worker summary with department - used in time registration list responses
 */
export type WorkerSummaryWithDepartmentDTO = Pick<
  WorkerDTO,
  "id" | "first_name" | "last_name" | "department"
>;

/**
 * Worker statistics for detailed worker view
 */
export interface WorkerStatsDTO {
  total_registrations: number;
  total_hours_worked: number;
  average_daily_hours: number;
}

/**
 * Worker with statistics - returned by GET /api/workers/:id
 */
export interface WorkerWithStatsDTO extends WorkerDTO {
  stats: WorkerStatsDTO;
}

// =============================================================================
// WORKER COMMAND MODELS (Input DTOs)
// =============================================================================

/**
 * Create Worker Command - request body for POST /api/workers
 * Note: Uses 'pin' (plain text) instead of 'pin_hash' - server will hash it
 */
export interface CreateWorkerCommand {
  first_name: string;
  last_name: string;
  pin: string; // 4-6 digits, will be hashed server-side
  department?: string | null;
  is_active?: boolean;
}

/**
 * Update Worker Command - request body for PATCH /api/workers/:id
 * All fields optional for partial updates
 */
export type UpdateWorkerCommand = Partial<
  Pick<WorkerDTO, "first_name" | "last_name" | "department" | "is_active">
>;

/**
 * Update Worker PIN Command - request body for PATCH /api/workers/:id/pin
 */
export interface UpdateWorkerPinCommand {
  new_pin: string; // 4-6 digits, will be hashed server-side
}

// =============================================================================
// WORKER QUERY PARAMETERS
// =============================================================================

/**
 * Query parameters for GET /api/workers (list with filtering)
 */
export interface ListWorkersQueryParams {
  search?: string;
  department?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: "first_name" | "last_name" | "created_at";
  sort_order?: "asc" | "desc";
}

// =============================================================================
// TIME REGISTRATION DTOs
// =============================================================================

/**
 * Base Time Registration DTO with computed duration
 */
export interface TimeRegistrationDTO extends TimeRegistrationEntity {
  duration_hours?: number; // Computed field: (check_out - check_in) in hours, only present when completed
}

/**
 * Time Registration with embedded worker information
 * Used in list responses: GET /api/admin/time-registrations
 */
export interface TimeRegistrationWithWorkerDTO extends TimeRegistrationDTO {
  worker: WorkerSummaryWithDepartmentDTO;
}

/**
 * Admin summary DTO - minimal admin information for nested responses
 */
export type AdminSummaryDTO = Pick<
  AdminEntity,
  "id" | "first_name" | "last_name"
>;

/**
 * Time Registration with full details (worker + admin)
 * Used in single registration response: GET /api/admin/time-registrations/:id
 */
export interface TimeRegistrationWithDetailsDTO extends TimeRegistrationDTO {
  worker: WorkerSummaryWithDepartmentDTO;
  modified_by_admin?: AdminSummaryDTO | null;
}

/**
 * Simplified registration DTO for check-in/check-out toggle responses
 * Excludes some administrative fields
 */
export type TimeRegistrationToggleDTO = Pick<
  TimeRegistrationDTO,
  | "id"
  | "worker_id"
  | "check_in"
  | "check_out"
  | "status"
  | "manual_intervention"
> & {
  duration_hours?: number;
};

// =============================================================================
// TIME REGISTRATION COMMAND MODELS (Input DTOs)
// =============================================================================

/**
 * Toggle Check-in/Check-out Command - request body for POST /api/time-registrations/toggle
 * PIN-based authentication for workers
 */
export interface TimeRegistrationToggleCommand {
  pin: string; // 4-6 digits
}

/**
 * Toggle response data structure
 */
export interface TimeRegistrationToggleResponseData {
  action: "check_in" | "check_out";
  registration: TimeRegistrationToggleDTO;
  worker: WorkerSummaryDTO;
}

/**
 * Create Time Registration Command - request body for POST /api/admin/time-registrations
 * Admin manually creates a check-in record
 */
export interface CreateTimeRegistrationCommand {
  worker_id: string;
  check_in: string; // ISO 8601 timestamp
  notes?: string;
}

/**
 * Update Time Registration Command - request body for PATCH /api/admin/time-registrations/:id
 * Admin updates registration (manual check-out or corrections)
 */
export interface UpdateTimeRegistrationCommand {
  check_in?: string; // ISO 8601 timestamp
  check_out?: string; // ISO 8601 timestamp
  status?: "in_progress" | "completed";
  notes?: string;
}

// =============================================================================
// TIME REGISTRATION QUERY PARAMETERS
// =============================================================================

/**
 * Query parameters for GET /api/admin/time-registrations (list with filtering)
 */
export interface ListTimeRegistrationsQueryParams {
  worker_id?: string;
  status?: "in_progress" | "completed";
  manual_intervention?: boolean;
  date_from?: string; // ISO date
  date_to?: string; // ISO date
  page?: number;
  limit?: number;
  sort_by?: "check_in" | "check_out" | "created_at";
  sort_order?: "asc" | "desc";
}

// =============================================================================
// ADMIN DTOs
// =============================================================================

/**
 * Admin profile DTO for API responses
 */
export type AdminDTO = AdminEntity;

// =============================================================================
// DASHBOARD DTOs
// =============================================================================

/**
 * Time period for dashboard statistics
 */
export interface TimePeriodDTO {
  from: string; // ISO 8601 timestamp
  to: string; // ISO 8601 timestamp
}

/**
 * Registration statistics for dashboard
 */
export interface DashboardRegistrationStatsDTO {
  total: number;
  completed: number;
  in_progress: number;
  manual_interventions: number;
  manual_intervention_rate: number; // Percentage
}

/**
 * Worker statistics for dashboard
 */
export interface DashboardWorkerStatsDTO {
  total: number;
  active: number;
  inactive: number;
  with_active_registration: number;
}

/**
 * Work hours statistics for dashboard
 */
export interface DashboardWorkHoursStatsDTO {
  total_hours: number;
  average_per_registration: number;
  average_per_worker: number;
}

/**
 * Performance statistics for dashboard
 */
export interface DashboardPerformanceStatsDTO {
  average_registration_time_seconds: number;
  successful_registrations_rate: number; // Percentage
}

/**
 * Recent activity statistics for dashboard
 */
export interface DashboardRecentActivityStatsDTO {
  today_registrations: number;
  today_hours: number;
}

/**
 * Complete dashboard statistics DTO
 * Response for GET /api/admin/dashboard/stats
 */
export interface DashboardStatsDTO {
  time_period: TimePeriodDTO;
  registrations: DashboardRegistrationStatsDTO;
  workers: DashboardWorkerStatsDTO;
  work_hours: DashboardWorkHoursStatsDTO;
  performance: DashboardPerformanceStatsDTO;
  recent_activity: DashboardRecentActivityStatsDTO;
}

/**
 * Recent time entry DTO for dashboard
 * Used in GET /api/admin/dashboard/recent-entries
 */
export interface RecentTimeEntryDTO {
  id: string;
  worker: WorkerSummaryDTO;
  check_in: string;
  check_out: string | null;
  duration_hours?: number;
  status: string;
  manual_intervention: boolean;
  created_at: string;
}

// =============================================================================
// DASHBOARD QUERY PARAMETERS
// =============================================================================

/**
 * Query parameters for GET /api/admin/dashboard/stats
 */
export interface DashboardStatsQueryParams {
  date_from?: string; // ISO date
  date_to?: string; // ISO date
}

/**
 * Query parameters for GET /api/admin/dashboard/recent-entries
 */
export interface RecentEntriesQueryParams {
  limit?: number; // Default: 10, max: 50
}

// =============================================================================
// PAGINATION DTOs
// =============================================================================

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Paginated list response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

/**
 * Standard success response wrapper
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error details structure
 */
export interface ApiErrorDetails {
  [field: string]: string;
}

/**
 * Standard error response wrapper
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetails;
  };
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// SPECIFIC API RESPONSE TYPES (commonly used combinations)
// =============================================================================

/**
 * List workers response - GET /api/workers
 */
export type ListWorkersResponse = ApiSuccessResponse<
  PaginatedResponse<WorkerDTO>
>;

/**
 * Get worker by ID response - GET /api/workers/:id
 */
export type GetWorkerResponse = ApiSuccessResponse<WorkerWithStatsDTO>;

/**
 * Create worker response - POST /api/workers
 */
export type CreateWorkerResponse = ApiSuccessResponse<WorkerDTO>;

/**
 * Update worker response - PATCH /api/workers/:id
 */
export type UpdateWorkerResponse = ApiSuccessResponse<WorkerDTO>;

/**
 * List time registrations response - GET /api/admin/time-registrations
 */
export type ListTimeRegistrationsResponse = ApiSuccessResponse<
  PaginatedResponse<TimeRegistrationWithWorkerDTO>
>;

/**
 * Get time registration by ID response - GET /api/admin/time-registrations/:id
 */
export type GetTimeRegistrationResponse =
  ApiSuccessResponse<TimeRegistrationWithDetailsDTO>;

/**
 * Create time registration response - POST /api/admin/time-registrations
 */
export type CreateTimeRegistrationResponse =
  ApiSuccessResponse<TimeRegistrationDTO>;

/**
 * Update time registration response - PATCH /api/admin/time-registrations/:id
 */
export type UpdateTimeRegistrationResponse =
  ApiSuccessResponse<TimeRegistrationDTO>;

/**
 * Toggle check-in/check-out response - POST /api/time-registrations/toggle
 */
export type ToggleTimeRegistrationResponse =
  ApiSuccessResponse<TimeRegistrationToggleResponseData>;

/**
 * Dashboard statistics response - GET /api/admin/dashboard/stats
 */
export type GetDashboardStatsResponse = ApiSuccessResponse<DashboardStatsDTO>;

/**
 * Recent entries response - GET /api/admin/dashboard/recent-entries
 */
export type GetRecentEntriesResponse = ApiSuccessResponse<{
  entries: RecentTimeEntryDTO[];
}>;

// =============================================================================
// TYPE GUARDS (utility functions for type narrowing)
// =============================================================================

/**
 * Type guard to check if response is a success response
 */
export function isApiSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error response
 */
export function isApiErrorResponse(
  response: ApiResponse<unknown>
): response is ApiErrorResponse {
  return response.success === false;
}

// =============================================================================
// CONSTANTS AND ENUMS
// =============================================================================

/**
 * Time registration status values
 */
export const TIME_REGISTRATION_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type TimeRegistrationStatus =
  (typeof TIME_REGISTRATION_STATUS)[keyof typeof TIME_REGISTRATION_STATUS];

/**
 * API error codes
 */
export const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Sort order values
 */
export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
