# TimeFly REST API - Complete Implementation Plan

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Shared Components](#3-shared-components)
4. [Worker Endpoints](#4-worker-endpoints)
5. [Time Registration Endpoints (Worker)](#5-time-registration-endpoints-worker)
6. [Time Registration Endpoints (Admin)](#6-time-registration-endpoints-admin)
7. [Dashboard Endpoints](#7-dashboard-endpoints)
8. [Security Implementation](#8-security-implementation)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Implementation Steps](#10-implementation-steps)

---

## 1. Architecture Overview

### 1.1 Technology Stack

- **Framework**: Astro 5 with Server Endpoints
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT) for admins, PIN-based for workers
- **Validation**: Zod schemas

### 1.2 Design Principles

1. **Separation of Concerns**: Route handlers, business logic (services), and data access layers are separated
2. **Type Safety**: All DTOs and database types are strictly typed
3. **Security First**: RLS policies, input validation, and authentication checks at every layer
4. **Error Handling**: Consistent error responses across all endpoints
5. **DRY Principle**: Shared utilities for common operations (pagination, validation, error handling)

### 1.3 Request Flow

```
Client Request
    ↓
Astro Middleware (adds Supabase client to context)
    ↓
Route Handler (src/pages/api/...)
    ↓
Authentication/Authorization Check
    ↓
Input Validation (Zod schemas)
    ↓
Service Layer (business logic)
    ↓
Database Layer (Supabase queries)
    ↓
Response Formatting
    ↓
Client Response
```

---

## 2. Project Structure

```
src/
├── pages/
│   └── api/
│       ├── workers/
│       │   ├── index.ts              # GET /api/workers, POST /api/workers
│       │   ├── [id].ts               # GET /api/workers/:id, PATCH /api/workers/:id, DELETE /api/workers/:id
│       │   └── [id]/
│       │       └── pin.ts            # PATCH /api/workers/:id/pin
│       ├── time-registrations/
│       │   └── toggle.ts             # POST /api/time-registrations/toggle
│       └── admin/
│           ├── time-registrations/
│           │   ├── index.ts          # GET /api/admin/time-registrations, POST /api/admin/time-registrations
│           │   └── [id].ts           # GET /api/admin/time-registrations/:id, PATCH, DELETE
│           └── dashboard/
│               ├── stats.ts          # GET /api/admin/dashboard/stats
│               └── recent-entries.ts # GET /api/admin/dashboard/recent-entries
│
├── lib/
│   ├── services/
│   │   ├── worker.service.ts         # Worker business logic
│   │   ├── time-registration.service.ts  # Time registration business logic
│   │   ├── dashboard.service.ts      # Dashboard statistics logic
│   │   └── auth.service.ts           # Authentication helper functions
│   ├── validators/
│   │   ├── worker.validators.ts      # Zod schemas for worker operations
│   │   ├── time-registration.validators.ts
│   │   └── common.validators.ts      # Shared validation schemas
│   ├── utils/
│   │   ├── api-response.ts           # Response formatting utilities
│   │   ├── error-handler.ts          # Centralized error handling
│   │   ├── pagination.ts             # Pagination utilities
│   │   └── password.ts               # PIN hashing utilities (bcrypt)
│   └── middleware/
│       ├── auth.middleware.ts        # Admin authentication middleware
│       └── rate-limit.middleware.ts  # Rate limiting (future enhancement)
│
├── types.ts                          # Already exists - DTOs and types
├── db/
│   ├── database.types.ts             # Already exists - Supabase generated types
│   └── supabase.client.ts            # Already exists - Supabase client
└── middleware/
    └── index.ts                      # Already exists - Global middleware
```

---

## 3. Shared Components

### 3.1 API Response Utilities (`lib/utils/api-response.ts`)

**Purpose**: Standardize API responses across all endpoints

**Implementation**:

```typescript
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMetadata,
} from "@/types";

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): { body: ApiSuccessResponse<T>; status: number } {
  return {
    body: {
      success: true,
      data,
      ...(message && { message }),
    },
    status,
  };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string>
): { body: ApiErrorResponse; status: number } {
  return {
    body: {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    status,
  };
}

export function paginationMetadata(
  page: number,
  limit: number,
  totalItems: number
): PaginationMetadata {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    total_items: totalItems,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_previous: page > 1,
  };
}
```

### 3.2 Error Handler (`lib/utils/error-handler.ts`)

**Purpose**: Centralized error handling and logging

**Implementation**:

```typescript
import { API_ERROR_CODES } from "@/types";
import { errorResponse } from "./api-response";

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public message: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    );
  }

  // Supabase errors
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as { code: string; message: string };

    // Handle specific Supabase error codes
    if (supabaseError.code === "23505") {
      // Unique violation
      return errorResponse(
        API_ERROR_CODES.CONFLICT,
        "Resource already exists",
        409
      );
    }

    if (supabaseError.code === "23503") {
      // Foreign key violation
      return errorResponse(
        API_ERROR_CODES.BAD_REQUEST,
        "Referenced resource does not exist",
        400
      );
    }
  }

  // Default error
  return errorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
    500
  );
}
```

### 3.3 Authentication Middleware (`lib/middleware/auth.middleware.ts`)

**Purpose**: Verify admin authentication using Supabase JWT

**Implementation**:

```typescript
import type { APIContext } from "astro";
import { AppError } from "../utils/error-handler";
import { API_ERROR_CODES } from "@/types";

export async function requireAdmin(context: APIContext) {
  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      API_ERROR_CODES.UNAUTHORIZED,
      401,
      "Missing or invalid authentication token"
    );
  }

  const token = authHeader.replace("Bearer ", "");

  // Get user from token
  const {
    data: { user },
    error,
  } = await context.locals.supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError(
      API_ERROR_CODES.UNAUTHORIZED,
      401,
      "Invalid authentication token"
    );
  }

  // Check if user is admin
  const { data: admin, error: adminError } = await context.locals.supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (adminError || !admin) {
    throw new AppError(API_ERROR_CODES.FORBIDDEN, 403, "User is not an admin");
  }

  return { user, admin };
}
```

### 3.4 Pagination Utilities (`lib/utils/pagination.ts`)

**Purpose**: Handle pagination logic consistently

**Implementation**:

```typescript
import { PAGINATION_DEFAULTS } from "@/types";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function parsePaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Math.max(1, params.limit || PAGINATION_DEFAULTS.LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
```

### 3.5 Password Utilities (`lib/utils/password.ts`)

**Purpose**: Hash and verify PINs using bcrypt

**Implementation**:

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
```

### 3.6 Common Validators (`lib/validators/common.validators.ts`)

**Purpose**: Reusable Zod schemas

**Implementation**:

```typescript
import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, "PIN must be 4-6 digits");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const sortOrderSchema = z.enum(["asc", "desc"]).optional();

export const isoDateSchema = z
  .string()
  .datetime("Invalid ISO 8601 date format");
```

---

## 4. Worker Endpoints

### 4.1 List Workers - GET /api/workers

#### Overview

Retrieve paginated list of workers with filtering and sorting options. Admin only.

#### Request Details

- **Method**: GET
- **URL**: `/api/workers`
- **Authentication**: Required (Admin JWT)
- **Query Parameters**:
  - `search` (string, optional) - Search by first_name or last_name
  - `department` (string, optional) - Filter by department
  - `is_active` (boolean, optional) - Filter by active status (default: true)
  - `page` (integer, optional) - Page number (default: 1)
  - `limit` (integer, optional) - Items per page (default: 20, max: 100)
  - `sort_by` (string, optional) - Sort field: 'first_name', 'last_name', 'created_at' (default: 'last_name')
  - `sort_order` (string, optional) - Sort direction: 'asc', 'desc' (default: 'asc')

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: {
    workers: WorkerDTO[],
    pagination: PaginationMetadata
  }
}
```

#### Validator (`lib/validators/worker.validators.ts`)

```typescript
import { z } from "zod";
import { paginationSchema, sortOrderSchema } from "./common.validators";

export const listWorkersQuerySchema = z.object({
  search: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  is_active: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
  sort_by: z.enum(["first_name", "last_name", "created_at"]).optional(),
  sort_order: sortOrderSchema,
});
```

#### Service Method (`lib/services/worker.service.ts`)

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { WorkerDTO, ListWorkersQueryParams } from "@/types";
import { parsePaginationParams } from "../utils/pagination";

export class WorkerService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listWorkers(params: ListWorkersQueryParams) {
    const { page, limit, offset } = parsePaginationParams(params);
    const sortBy = params.sort_by || "last_name";
    const sortOrder = params.sort_order || "asc";

    let query = this.supabase.from("workers").select("*", { count: "exact" });

    // Apply filters
    if (params.search) {
      query = query.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
      );
    }

    if (params.department) {
      query = query.eq("department", params.department);
    }

    if (params.is_active !== undefined) {
      query = query.eq("is_active", params.is_active);
    } else {
      // Default: show only active workers
      query = query.eq("is_active", true);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Remove pin_hash from response
    const workers: WorkerDTO[] = (data || []).map(
      ({ pin_hash, ...worker }) => worker
    );

    return {
      workers,
      pagination: {
        page,
        limit,
        total_items: count || 0,
      },
    };
  }
}
```

#### Route Handler (`src/pages/api/workers/index.ts`)

```typescript
import type { APIRoute } from "astro";
import { WorkerService } from "@/lib/services/worker.service";
import { listWorkersQuerySchema } from "@/lib/validators/worker.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";
import { paginationMetadata } from "@/lib/utils/api-response";

export const GET: APIRoute = async (context) => {
  try {
    // Authenticate admin
    await requireAdmin(context);

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = listWorkersQuerySchema.parse(queryParams);

    // Execute business logic
    const workerService = new WorkerService(context.locals.supabase);
    const result = await workerService.listWorkers(validatedParams);

    // Format response
    return new Response(
      JSON.stringify(
        successResponse({
          workers: result.workers,
          pagination: paginationMetadata(
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total_items
          ),
        }).body
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `422 Unprocessable Entity` - Invalid query parameters
- `500 Internal Server Error` - Database or unexpected errors

---

### 4.2 Get Worker by ID - GET /api/workers/:id

#### Overview

Retrieve detailed information about a specific worker, including statistics. Admin only.

#### Request Details

- **Method**: GET
- **URL**: `/api/workers/:id`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Worker ID

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: WorkerWithStatsDTO
}
```

#### Validator

```typescript
export const workerIdParamSchema = z.object({
  id: uuidSchema,
});
```

#### Service Method

```typescript
async getWorkerById(id: string) {
  // Get worker data
  const { data: worker, error } = await this.supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Worker not found');
    }
    throw error;
  }

  // Calculate statistics
  const { data: stats } = await this.supabase
    .from('time_registrations')
    .select('check_in, check_out, status')
    .eq('worker_id', id)
    .eq('status', 'completed');

  const totalRegistrations = stats?.length || 0;
  const totalHoursWorked = stats?.reduce((sum, reg) => {
    if (reg.check_out) {
      const hours = (new Date(reg.check_out).getTime() - new Date(reg.check_in).getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }
    return sum;
  }, 0) || 0;

  const averageDailyHours = totalRegistrations > 0
    ? totalHoursWorked / totalRegistrations
    : 0;

  // Remove pin_hash
  const { pin_hash, ...workerData } = worker;

  return {
    ...workerData,
    stats: {
      total_registrations: totalRegistrations,
      total_hours_worked: Math.round(totalHoursWorked * 100) / 100,
      average_daily_hours: Math.round(averageDailyHours * 100) / 100
    }
  };
}
```

#### Route Handler (`src/pages/api/workers/[id].ts`)

```typescript
export const GET: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const { id } = workerIdParamSchema.parse({ id: context.params.id });

    const workerService = new WorkerService(context.locals.supabase);
    const worker = await workerService.getWorkerById(id);

    return new Response(JSON.stringify(successResponse(worker).body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Worker not found
- `500 Internal Server Error` - Database or unexpected errors

---

### 4.3 Create Worker - POST /api/workers

#### Overview

Create a new worker with PIN authentication. Admin only.

#### Request Details

- **Method**: POST
- **URL**: `/api/workers`
- **Authentication**: Required (Admin JWT)
- **Request Body**:

```typescript
{
  first_name: string,
  last_name: string,
  pin: string,        // 4-6 digits
  department?: string,
  is_active?: boolean
}
```

#### Response Details

- **Success (201 Created)**:

```typescript
{
  success: true,
  data: WorkerDTO,
  message: "Worker created successfully"
}
```

#### Validator

```typescript
export const createWorkerSchema = z.object({
  first_name: z
    .string()
    .min(1)
    .max(100, "First name must be max 100 characters"),
  last_name: z.string().min(1).max(100, "Last name must be max 100 characters"),
  pin: pinSchema,
  department: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional(),
});
```

#### Service Method

```typescript
async createWorker(command: CreateWorkerCommand) {
  // Hash the PIN
  const pinHash = await hashPin(command.pin);

  // Check if PIN already exists
  const { data: existingWorker } = await this.supabase
    .from('workers')
    .select('id')
    .eq('pin_hash', pinHash)
    .single();

  if (existingWorker) {
    throw new AppError(
      API_ERROR_CODES.CONFLICT,
      409,
      'PIN already exists'
    );
  }

  // Create worker
  const { data, error } = await this.supabase
    .from('workers')
    .insert({
      first_name: command.first_name,
      last_name: command.last_name,
      pin_hash: pinHash,
      department: command.department || null,
      is_active: command.is_active ?? true
    })
    .select()
    .single();

  if (error) throw error;

  // Remove pin_hash from response
  const { pin_hash: _, ...worker } = data;
  return worker;
}
```

#### Route Handler (add to `src/pages/api/workers/index.ts`)

```typescript
export const POST: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const body = await context.request.json();
    const validatedData = createWorkerSchema.parse(body);

    const workerService = new WorkerService(context.locals.supabase);
    const worker = await workerService.createWorker(validatedData);

    return new Response(
      JSON.stringify(
        successResponse(worker, "Worker created successfully", 201).body
      ),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `400 Bad Request` - Invalid request body format
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `409 Conflict` - PIN already exists
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Database or unexpected errors

---

### 4.4 Update Worker - PATCH /api/workers/:id

#### Overview

Update worker information (excluding PIN). Admin only.

#### Request Details

- **Method**: PATCH
- **URL**: `/api/workers/:id`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Worker ID
- **Request Body** (all fields optional):

```typescript
{
  first_name?: string,
  last_name?: string,
  department?: string,
  is_active?: boolean
}
```

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: WorkerDTO,
  message: "Worker updated successfully"
}
```

#### Validator

```typescript
export const updateWorkerSchema = z
  .object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    department: z.string().max(100).optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
```

#### Service Method

```typescript
async updateWorker(id: string, command: UpdateWorkerCommand) {
  // Check if worker exists
  const { data: existingWorker, error: checkError } = await this.supabase
    .from('workers')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError || !existingWorker) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Worker not found');
  }

  // Update worker
  const { data, error } = await this.supabase
    .from('workers')
    .update(command)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Remove pin_hash from response
  const { pin_hash, ...worker } = data;
  return worker;
}
```

#### Route Handler (add to `src/pages/api/workers/[id].ts`)

```typescript
export const PATCH: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const { id } = workerIdParamSchema.parse({ id: context.params.id });
    const body = await context.request.json();
    const validatedData = updateWorkerSchema.parse(body);

    const workerService = new WorkerService(context.locals.supabase);
    const worker = await workerService.updateWorker(id, validatedData);

    return new Response(
      JSON.stringify(
        successResponse(worker, "Worker updated successfully").body
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `400 Bad Request` - Invalid request body or no fields provided
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Worker not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Database or unexpected errors

---

### 4.5 Update Worker PIN - PATCH /api/workers/:id/pin

#### Overview

Update worker's PIN separately for security. Admin only.

#### Request Details

- **Method**: PATCH
- **URL**: `/api/workers/:id/pin`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Worker ID
- **Request Body**:

```typescript
{
  new_pin: string; // 4-6 digits
}
```

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  message: "PIN updated successfully"
}
```

#### Validator

```typescript
export const updateWorkerPinSchema = z.object({
  new_pin: pinSchema,
});
```

#### Service Method

```typescript
async updateWorkerPin(id: string, newPin: string) {
  // Check if worker exists
  const { data: existingWorker, error: checkError } = await this.supabase
    .from('workers')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError || !existingWorker) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Worker not found');
  }

  // Hash new PIN
  const pinHash = await hashPin(newPin);

  // Check if new PIN already exists (for different worker)
  const { data: conflictWorker } = await this.supabase
    .from('workers')
    .select('id')
    .eq('pin_hash', pinHash)
    .neq('id', id)
    .single();

  if (conflictWorker) {
    throw new AppError(
      API_ERROR_CODES.CONFLICT,
      409,
      'PIN already in use'
    );
  }

  // Update PIN
  const { error } = await this.supabase
    .from('workers')
    .update({ pin_hash: pinHash })
    .eq('id', id);

  if (error) throw error;
}
```

#### Route Handler (`src/pages/api/workers/[id]/pin.ts`)

```typescript
import type { APIRoute } from "astro";
import { WorkerService } from "@/lib/services/worker.service";
import {
  workerIdParamSchema,
  updateWorkerPinSchema,
} from "@/lib/validators/worker.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const PATCH: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const { id } = workerIdParamSchema.parse({ id: context.params.id });
    const body = await context.request.json();
    const { new_pin } = updateWorkerPinSchema.parse(body);

    const workerService = new WorkerService(context.locals.supabase);
    await workerService.updateWorkerPin(id, new_pin);

    return new Response(
      JSON.stringify(successResponse(null, "PIN updated successfully").body),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `400 Bad Request` - Invalid PIN format
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Worker not found
- `409 Conflict` - PIN already in use
- `500 Internal Server Error` - Database or unexpected errors

---

### 4.6 Deactivate Worker - DELETE /api/workers/:id

#### Overview

Soft delete worker by setting is_active to false. Admin only.

#### Request Details

- **Method**: DELETE
- **URL**: `/api/workers/:id`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Worker ID

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  message: "Worker deactivated successfully"
}
```

#### Service Method

```typescript
async deactivateWorker(id: string) {
  const { data, error } = await this.supabase
    .from('workers')
    .update({ is_active: false })
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Worker not found');
    }
    throw error;
  }
}
```

#### Route Handler (add to `src/pages/api/workers/[id].ts`)

```typescript
export const DELETE: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const { id } = workerIdParamSchema.parse({ id: context.params.id });

    const workerService = new WorkerService(context.locals.supabase);
    await workerService.deactivateWorker(id);

    return new Response(
      JSON.stringify(
        successResponse(null, "Worker deactivated successfully").body
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Worker not found
- `500 Internal Server Error` - Database or unexpected errors

---

## 5. Time Registration Endpoints (Worker)

### 5.1 Toggle Check-in/Check-out - POST /api/time-registrations/toggle

#### Overview

Worker check-in or check-out using PIN. Automatically determines action based on current state. No JWT authentication required.

#### Request Details

- **Method**: POST
- **URL**: `/api/time-registrations/toggle`
- **Authentication**: None (PIN-based)
- **Request Body**:

```typescript
{
  pin: string; // 4-6 digits
}
```

#### Response Details

- **Success - Check-in (201 Created)**:

```typescript
{
  success: true,
  data: {
    action: "check_in",
    registration: TimeRegistrationToggleDTO,
    worker: WorkerSummaryDTO
  },
  message: "Check-in successful"
}
```

- **Success - Check-out (200 OK)**:

```typescript
{
  success: true,
  data: {
    action: "check_out",
    registration: TimeRegistrationToggleDTO,
    worker: WorkerSummaryDTO
  },
  message: "Check-out successful"
}
```

#### Validator (`lib/validators/time-registration.validators.ts`)

```typescript
export const toggleTimeRegistrationSchema = z.object({
  pin: pinSchema,
});
```

#### Service Method (`lib/services/time-registration.service.ts`)

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { verifyPin } from "../utils/password";
import { AppError } from "../utils/error-handler";
import { API_ERROR_CODES } from "@/types";

export class TimeRegistrationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async toggleCheckInOut(pin: string) {
    // Find worker by PIN (use service role to bypass RLS)
    const { data: workers } = await this.supabase
      .from("workers")
      .select("id, first_name, last_name, pin_hash, is_active");

    if (!workers || workers.length === 0) {
      throw new AppError(API_ERROR_CODES.UNAUTHORIZED, 401, "Invalid PIN");
    }

    // Verify PIN
    let worker = null;
    for (const w of workers) {
      if (await verifyPin(pin, w.pin_hash)) {
        worker = w;
        break;
      }
    }

    if (!worker) {
      throw new AppError(API_ERROR_CODES.UNAUTHORIZED, 401, "Invalid PIN");
    }

    if (!worker.is_active) {
      throw new AppError(
        API_ERROR_CODES.NOT_FOUND,
        404,
        "Worker not found or inactive"
      );
    }

    // Check for active registration
    const { data: activeRegistration } = await this.supabase
      .from("time_registrations")
      .select("*")
      .eq("worker_id", worker.id)
      .eq("status", "in_progress")
      .single();

    if (activeRegistration) {
      // CHECK-OUT
      const checkOutTime = new Date().toISOString();
      const { data, error } = await this.supabase
        .from("time_registrations")
        .update({
          check_out: checkOutTime,
          status: "completed",
        })
        .eq("id", activeRegistration.id)
        .select()
        .single();

      if (error) throw error;

      const durationHours =
        (new Date(checkOutTime).getTime() - new Date(data.check_in).getTime()) /
        (1000 * 60 * 60);

      return {
        action: "check_out" as const,
        registration: {
          id: data.id,
          worker_id: data.worker_id,
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          manual_intervention: data.manual_intervention,
          duration_hours: Math.round(durationHours * 100) / 100,
        },
        worker: {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name,
        },
      };
    } else {
      // CHECK-IN
      const { data, error } = await this.supabase
        .from("time_registrations")
        .insert({
          worker_id: worker.id,
          check_in: new Date().toISOString(),
          status: "in_progress",
          manual_intervention: false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        action: "check_in" as const,
        registration: {
          id: data.id,
          worker_id: data.worker_id,
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
          manual_intervention: data.manual_intervention,
        },
        worker: {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name,
        },
      };
    }
  }
}
```

#### Route Handler (`src/pages/api/time-registrations/toggle.ts`)

```typescript
import type { APIRoute } from "astro";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import { toggleTimeRegistrationSchema } from "@/lib/validators/time-registration.validators";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const { pin } = toggleTimeRegistrationSchema.parse(body);

    const service = new TimeRegistrationService(context.locals.supabase);
    const result = await service.toggleCheckInOut(pin);

    const message =
      result.action === "check_in"
        ? "Check-in successful"
        : "Check-out successful";

    const status = result.action === "check_in" ? 201 : 200;

    return new Response(
      JSON.stringify(successResponse(result, message, status).body),
      { status, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Security Considerations

- **Rate Limiting**: Implement rate limiting (10 requests/minute per IP)
- **PIN Verification**: Compare hashed PINs securely using bcrypt
- **Active Worker Check**: Only active workers can check in/out
- **No Session Created**: Each action requires PIN verification

#### Error Scenarios

- `400 Bad Request` - Missing PIN or invalid format
- `401 Unauthorized` - Invalid PIN
- `404 Not Found` - Worker not found or inactive
- `500 Internal Server Error` - Database or unexpected errors

---

## 6. Time Registration Endpoints (Admin)

### 6.1 List Time Registrations - GET /api/admin/time-registrations

#### Overview

Retrieve paginated list of time registrations with filtering options. Admin only.

#### Request Details

- **Method**: GET
- **URL**: `/api/admin/time-registrations`
- **Authentication**: Required (Admin JWT)
- **Query Parameters**:
  - `worker_id` (UUID, optional) - Filter by specific worker
  - `status` (string, optional) - Filter by status: 'in_progress', 'completed'
  - `manual_intervention` (boolean, optional) - Filter by manual intervention flag
  - `date_from` (ISO date, optional) - Filter registrations from this date
  - `date_to` (ISO date, optional) - Filter registrations until this date
  - `page` (integer, optional) - Page number (default: 1)
  - `limit` (integer, optional) - Items per page (default: 20, max: 100)
  - `sort_by` (string, optional) - Sort field: 'check_in', 'check_out', 'created_at' (default: 'check_in')
  - `sort_order` (string, optional) - Sort direction: 'asc', 'desc' (default: 'desc')

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: {
    registrations: TimeRegistrationWithWorkerDTO[],
    pagination: PaginationMetadata
  }
}
```

#### Validator

```typescript
export const listTimeRegistrationsQuerySchema = z.object({
  worker_id: uuidSchema.optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  manual_intervention: z.coerce.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  ...paginationSchema.shape,
  sort_by: z.enum(["check_in", "check_out", "created_at"]).optional(),
  sort_order: sortOrderSchema,
});
```

#### Service Method

```typescript
async listTimeRegistrations(params: ListTimeRegistrationsQueryParams) {
  const { page, limit, offset } = parsePaginationParams(params);
  const sortBy = params.sort_by || 'check_in';
  const sortOrder = params.sort_order || 'desc';

  let query = this.supabase
    .from('time_registrations')
    .select(`
      *,
      worker:workers!inner(id, first_name, last_name, department)
    `, { count: 'exact' });

  // Apply filters
  if (params.worker_id) {
    query = query.eq('worker_id', params.worker_id);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.manual_intervention !== undefined) {
    query = query.eq('manual_intervention', params.manual_intervention);
  }

  if (params.date_from) {
    query = query.gte('check_in', params.date_from);
  }

  if (params.date_to) {
    query = query.lte('check_in', params.date_to);
  }

  // Apply sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  // Format response with computed duration
  const registrations = (data || []).map(reg => {
    const duration = reg.check_out
      ? (new Date(reg.check_out).getTime() - new Date(reg.check_in).getTime()) / (1000 * 60 * 60)
      : undefined;

    return {
      ...reg,
      duration_hours: duration ? Math.round(duration * 100) / 100 : undefined
    };
  });

  return {
    registrations,
    pagination: {
      page,
      limit,
      total_items: count || 0
    }
  };
}
```

#### Route Handler (`src/pages/api/admin/time-registrations/index.ts`)

```typescript
import type { APIRoute } from "astro";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import { listTimeRegistrationsQuerySchema } from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse, paginationMetadata } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const GET: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = listTimeRegistrationsQuerySchema.parse(queryParams);

    const service = new TimeRegistrationService(context.locals.supabase);
    const result = await service.listTimeRegistrations(validatedParams);

    return new Response(
      JSON.stringify(
        successResponse({
          registrations: result.registrations,
          pagination: paginationMetadata(
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total_items
          ),
        }).body
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `422 Unprocessable Entity` - Invalid query parameters
- `500 Internal Server Error` - Database or unexpected errors

---

### 6.2 Get Time Registration by ID - GET /api/admin/time-registrations/:id

#### Overview

Retrieve detailed information about a specific time registration, including worker and admin details. Admin only.

#### Request Details

- **Method**: GET
- **URL**: `/api/admin/time-registrations/:id`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Registration ID

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: TimeRegistrationWithDetailsDTO
}
```

#### Validator

```typescript
export const timeRegistrationIdParamSchema = z.object({
  id: uuidSchema,
});
```

#### Service Method

```typescript
async getTimeRegistrationById(id: string) {
  const { data, error } = await this.supabase
    .from('time_registrations')
    .select(`
      *,
      worker:workers!inner(id, first_name, last_name, department),
      modified_by_admin:admins(id, first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Registration not found');
    }
    throw error;
  }

  // Calculate duration if completed
  const duration = data.check_out
    ? (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / (1000 * 60 * 60)
    : undefined;

  return {
    ...data,
    duration_hours: duration ? Math.round(duration * 100) / 100 : undefined
  };
}
```

#### Route Handler (`src/pages/api/admin/time-registrations/[id].ts`)

```typescript
import type { APIRoute } from "astro";
import { TimeRegistrationService } from "@/lib/services/time-registration.service";
import { timeRegistrationIdParamSchema } from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const GET: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id,
    });

    const service = new TimeRegistrationService(context.locals.supabase);
    const registration = await service.getTimeRegistrationById(id);

    return new Response(JSON.stringify(successResponse(registration).body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Registration not found
- `500 Internal Server Error` - Database or unexpected errors

---

### 6.3 Create Time Registration - POST /api/admin/time-registrations

#### Overview

Admin manually creates a time registration (check-in) for a worker. Admin only.

#### Request Details

- **Method**: POST
- **URL**: `/api/admin/time-registrations`
- **Authentication**: Required (Admin JWT)
- **Request Body**:

```typescript
{
  worker_id: string,    // UUID
  check_in: string,     // ISO 8601 timestamp
  notes?: string
}
```

#### Response Details

- **Success (201 Created)**:

```typescript
{
  success: true,
  data: TimeRegistrationDTO,
  message: "Time registration created successfully"
}
```

#### Validator

```typescript
export const createTimeRegistrationSchema = z.object({
  worker_id: uuidSchema,
  check_in: isoDateSchema,
  notes: z.string().max(1000).optional(),
});
```

#### Service Method

```typescript
async createTimeRegistration(command: CreateTimeRegistrationCommand, adminId: string) {
  // Verify worker exists and is active
  const { data: worker, error: workerError } = await this.supabase
    .from('workers')
    .select('id, is_active')
    .eq('id', command.worker_id)
    .single();

  if (workerError || !worker) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Worker not found');
  }

  if (!worker.is_active) {
    throw new AppError(API_ERROR_CODES.BAD_REQUEST, 400, 'Worker is not active');
  }

  // Check for existing in_progress registration
  const { data: activeReg } = await this.supabase
    .from('time_registrations')
    .select('id')
    .eq('worker_id', command.worker_id)
    .eq('status', 'in_progress')
    .single();

  if (activeReg) {
    throw new AppError(
      API_ERROR_CODES.CONFLICT,
      409,
      'Worker already has an active registration'
    );
  }

  // Validate timestamp is not in the future
  if (new Date(command.check_in) > new Date()) {
    throw new AppError(
      API_ERROR_CODES.BAD_REQUEST,
      400,
      'Check-in time cannot be in the future'
    );
  }

  // Create registration with manual intervention flag
  const { data, error } = await this.supabase
    .from('time_registrations')
    .insert({
      worker_id: command.worker_id,
      check_in: command.check_in,
      status: 'in_progress',
      manual_intervention: true,
      modified_by_admin_id: adminId,
      notes: command.notes || null
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
```

#### Route Handler (add to `src/pages/api/admin/time-registrations/index.ts`)

```typescript
export const POST: APIRoute = async (context) => {
  try {
    const { admin } = await requireAdmin(context);

    const body = await context.request.json();
    const validatedData = createTimeRegistrationSchema.parse(body);

    const service = new TimeRegistrationService(context.locals.supabase);
    const registration = await service.createTimeRegistration(
      validatedData,
      admin.id
    );

    return new Response(
      JSON.stringify(
        successResponse(
          registration,
          "Time registration created successfully",
          201
        ).body
      ),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `400 Bad Request` - Invalid data format or check_in in the future
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Worker not found
- `409 Conflict` - Worker already has an active registration
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Database or unexpected errors

---

### 6.4 Update Time Registration - PATCH /api/admin/time-registrations/:id

#### Overview

Admin updates time registration (manual check-out or edit existing registration). Admin only.

#### Request Details

- **Method**: PATCH
- **URL**: `/api/admin/time-registrations/:id`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Registration ID
- **Request Body** (all fields optional):

```typescript
{
  check_in?: string,     // ISO 8601 timestamp
  check_out?: string,    // ISO 8601 timestamp
  status?: string,       // 'in_progress' | 'completed'
  notes?: string
}
```

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: TimeRegistrationDTO,
  message: "Time registration updated successfully"
}
```

#### Validator

```typescript
export const updateTimeRegistrationSchema = z
  .object({
    check_in: isoDateSchema.optional(),
    check_out: isoDateSchema.optional(),
    status: z.enum(["in_progress", "completed"]).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.check_in && data.check_out) {
        return new Date(data.check_out) > new Date(data.check_in);
      }
      return true;
    },
    { message: "check_out must be after check_in" }
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
```

#### Service Method

```typescript
async updateTimeRegistration(
  id: string,
  command: UpdateTimeRegistrationCommand,
  adminId: string
) {
  // Get existing registration
  const { data: existing, error: fetchError } = await this.supabase
    .from('time_registrations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Registration not found');
  }

  // Validate check_out > check_in constraint
  const checkIn = command.check_in ? new Date(command.check_in) : new Date(existing.check_in);
  const checkOut = command.check_out ? new Date(command.check_out) : existing.check_out ? new Date(existing.check_out) : null;

  if (checkOut && checkOut <= checkIn) {
    throw new AppError(
      API_ERROR_CODES.BAD_REQUEST,
      400,
      'Check-out time must be after check-in time'
    );
  }

  // Auto-complete status if check_out is provided
  let status = command.status;
  if (command.check_out && !status) {
    status = 'completed';
  }

  // Update with manual intervention flag
  const updateData: any = {
    ...command,
    ...(status && { status }),
    manual_intervention: true,
    modified_by_admin_id: adminId
  };

  const { data, error } = await this.supabase
    .from('time_registrations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Calculate duration if completed
  const duration = data.check_out
    ? (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / (1000 * 60 * 60)
    : undefined;

  return {
    ...data,
    duration_hours: duration ? Math.round(duration * 100) / 100 : undefined
  };
}
```

#### Route Handler (add to `src/pages/api/admin/time-registrations/[id].ts`)

```typescript
export const PATCH: APIRoute = async (context) => {
  try {
    const { admin } = await requireAdmin(context);

    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id,
    });
    const body = await context.request.json();
    const validatedData = updateTimeRegistrationSchema.parse(body);

    const service = new TimeRegistrationService(context.locals.supabase);
    const registration = await service.updateTimeRegistration(
      id,
      validatedData,
      admin.id
    );

    return new Response(
      JSON.stringify(
        successResponse(registration, "Time registration updated successfully")
          .body
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `400 Bad Request` - Invalid data format or check_out <= check_in
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Registration not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Database or unexpected errors

---

### 6.5 Delete Time Registration - DELETE /api/admin/time-registrations/:id

#### Overview

Admin permanently deletes a time registration. Admin only.

#### Request Details

- **Method**: DELETE
- **URL**: `/api/admin/time-registrations/:id`
- **Authentication**: Required (Admin JWT)
- **Path Parameters**:
  - `id` (UUID, required) - Registration ID

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  message: "Time registration deleted successfully"
}
```

#### Service Method

```typescript
async deleteTimeRegistration(id: string) {
  const { data, error } = await this.supabase
    .from('time_registrations')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, 404, 'Registration not found');
    }
    throw error;
  }
}
```

#### Route Handler (add to `src/pages/api/admin/time-registrations/[id].ts`)

```typescript
export const DELETE: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id,
    });

    const service = new TimeRegistrationService(context.locals.supabase);
    await service.deleteTimeRegistration(id);

    return new Response(
      JSON.stringify(
        successResponse(null, "Time registration deleted successfully").body
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Registration not found
- `500 Internal Server Error` - Database or unexpected errors

---

## 7. Dashboard Endpoints

### 7.1 Get Dashboard Statistics - GET /api/admin/dashboard/stats

#### Overview

Retrieve aggregated KPI metrics for administrative dashboard. Admin only.

#### Request Details

- **Method**: GET
- **URL**: `/api/admin/dashboard/stats`
- **Authentication**: Required (Admin JWT)
- **Query Parameters**:
  - `date_from` (ISO date, optional) - Calculate stats from this date (default: 30 days ago)
  - `date_to` (ISO date, optional) - Calculate stats until this date (default: today)

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: DashboardStatsDTO
}
```

#### Validator

```typescript
export const dashboardStatsQuerySchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});
```

#### Service Method (`lib/services/dashboard.service.ts`)

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { DashboardStatsDTO } from "@/types";

export class DashboardService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getDashboardStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<DashboardStatsDTO> {
    // Default date range: last 30 days
    const defaultDateFrom = new Date();
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30);

    const from = dateFrom || defaultDateFrom.toISOString();
    const to = dateTo || new Date().toISOString();

    // Get all registrations in date range
    const { data: registrations } = await this.supabase
      .from("time_registrations")
      .select("*")
      .gte("check_in", from)
      .lte("check_in", to);

    const totalRegistrations = registrations?.length || 0;
    const completedRegistrations =
      registrations?.filter((r) => r.status === "completed").length || 0;
    const inProgressRegistrations =
      registrations?.filter((r) => r.status === "in_progress").length || 0;
    const manualInterventions =
      registrations?.filter((r) => r.manual_intervention).length || 0;

    // Calculate work hours
    const totalHours =
      registrations?.reduce((sum, reg) => {
        if (reg.check_out) {
          const hours =
            (new Date(reg.check_out).getTime() -
              new Date(reg.check_in).getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0) || 0;

    const avgPerRegistration =
      completedRegistrations > 0 ? totalHours / completedRegistrations : 0;

    // Get worker counts
    const { data: allWorkers } = await this.supabase
      .from("workers")
      .select("id, is_active");

    const totalWorkers = allWorkers?.length || 0;
    const activeWorkers = allWorkers?.filter((w) => w.is_active).length || 0;
    const inactiveWorkers = totalWorkers - activeWorkers;

    // Get workers with active registration
    const { data: workersWithActiveReg } = await this.supabase
      .from("time_registrations")
      .select("worker_id")
      .eq("status", "in_progress");

    const uniqueWorkersWithActiveReg = new Set(
      workersWithActiveReg?.map((r) => r.worker_id) || []
    ).size;

    const avgPerWorker = activeWorkers > 0 ? totalHours / activeWorkers : 0;

    // Get today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayRegistrations } = await this.supabase
      .from("time_registrations")
      .select("*")
      .gte("check_in", today.toISOString());

    const todayTotal = todayRegistrations?.length || 0;
    const todayHours =
      todayRegistrations?.reduce((sum, reg) => {
        if (reg.check_out) {
          const hours =
            (new Date(reg.check_out).getTime() -
              new Date(reg.check_in).getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0) || 0;

    return {
      time_period: {
        from,
        to,
      },
      registrations: {
        total: totalRegistrations,
        completed: completedRegistrations,
        in_progress: inProgressRegistrations,
        manual_interventions: manualInterventions,
        manual_intervention_rate:
          totalRegistrations > 0
            ? Math.round((manualInterventions / totalRegistrations) * 10000) /
              100
            : 0,
      },
      workers: {
        total: totalWorkers,
        active: activeWorkers,
        inactive: inactiveWorkers,
        with_active_registration: uniqueWorkersWithActiveReg,
      },
      work_hours: {
        total_hours: Math.round(totalHours * 100) / 100,
        average_per_registration: Math.round(avgPerRegistration * 100) / 100,
        average_per_worker: Math.round(avgPerWorker * 100) / 100,
      },
      performance: {
        average_registration_time_seconds: 2.3, // Placeholder - would need actual tracking
        successful_registrations_rate:
          totalRegistrations > 0
            ? Math.round(
                (completedRegistrations / totalRegistrations) * 10000
              ) / 100
            : 0,
      },
      recent_activity: {
        today_registrations: todayTotal,
        today_hours: Math.round(todayHours * 100) / 100,
      },
    };
  }
}
```

#### Route Handler (`src/pages/api/admin/dashboard/stats.ts`)

```typescript
import type { APIRoute } from "astro";
import { DashboardService } from "@/lib/services/dashboard.service";
import { dashboardStatsQuerySchema } from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const GET: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { date_from, date_to } = dashboardStatsQuerySchema.parse(queryParams);

    const service = new DashboardService(context.locals.supabase);
    const stats = await service.getDashboardStats(date_from, date_to);

    return new Response(JSON.stringify(successResponse(stats).body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `422 Unprocessable Entity` - Invalid date parameters
- `500 Internal Server Error` - Database or unexpected errors

---

### 7.2 Get Recent Time Entries - GET /api/admin/dashboard/recent-entries

#### Overview

Retrieve recent time registration entries for dashboard display. Admin only.

#### Request Details

- **Method**: GET
- **URL**: `/api/admin/dashboard/recent-entries`
- **Authentication**: Required (Admin JWT)
- **Query Parameters**:
  - `limit` (integer, optional) - Number of entries to return (default: 10, max: 50)

#### Response Details

- **Success (200 OK)**:

```typescript
{
  success: true,
  data: {
    entries: RecentTimeEntryDTO[]
  }
}
```

#### Validator

```typescript
export const recentEntriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
```

#### Service Method

```typescript
async getRecentEntries(limit: number = 10) {
  const { data, error } = await this.supabase
    .from('time_registrations')
    .select(`
      id,
      check_in,
      check_out,
      status,
      manual_intervention,
      created_at,
      worker:workers!inner(id, first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(entry => {
    const duration = entry.check_out
      ? (new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime()) / (1000 * 60 * 60)
      : undefined;

    return {
      id: entry.id,
      worker: entry.worker,
      check_in: entry.check_in,
      check_out: entry.check_out,
      duration_hours: duration ? Math.round(duration * 100) / 100 : undefined,
      status: entry.status,
      manual_intervention: entry.manual_intervention,
      created_at: entry.created_at
    };
  });
}
```

#### Route Handler (`src/pages/api/admin/dashboard/recent-entries.ts`)

```typescript
import type { APIRoute } from "astro";
import { DashboardService } from "@/lib/services/dashboard.service";
import { recentEntriesQuerySchema } from "@/lib/validators/time-registration.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const GET: APIRoute = async (context) => {
  try {
    await requireAdmin(context);

    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { limit } = recentEntriesQuerySchema.parse(queryParams);

    const service = new DashboardService(context.locals.supabase);
    const entries = await service.getRecentEntries(limit);

    return new Response(JSON.stringify(successResponse({ entries }).body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

#### Error Scenarios

- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Database or unexpected errors

---

## 8. Security Implementation

### 8.1 Authentication Strategy

#### Admin Authentication (JWT)

- **Method**: Supabase Auth with JWT tokens
- **Flow**:
  1. Admin logs in via Supabase Auth
  2. Client receives JWT access token
  3. Client includes token in Authorization header: `Bearer <token>`
  4. Server validates token using `supabase.auth.getUser(token)`
  5. Server verifies user is in `admins` table

#### Worker Authentication (PIN)

- **Method**: PIN-based verification
- **Security**:
  - PINs are hashed using bcrypt (10 salt rounds)
  - No session/token created
  - Each action requires PIN verification
  - Rate limiting applied (10 requests/minute per IP)

### 8.2 Authorization Checks

#### RLS Policies

All database queries respect Row Level Security policies:

- **Admins table**: Users can only view/update their own profile
- **Workers table**: Only authenticated admins have access
- **Time registrations table**: Only authenticated admins have access

#### Middleware Checks

- `requireAdmin()` function validates JWT and admin status on every protected route
- Returns both `user` and `admin` objects for use in service methods

### 8.3 Input Validation

#### Zod Schemas

All input validated using Zod schemas before processing:

- Type safety at runtime
- Custom error messages
- Complex validation rules (e.g., check_out > check_in)

#### Sanitization

- SQL injection prevention via Supabase parameterized queries
- XSS prevention via JSON responses (no HTML rendering)

### 8.4 Rate Limiting

**Future Enhancement** - Implement rate limiting middleware:

```typescript
// lib/middleware/rate-limit.middleware.ts
export function rateLimit(config: { windowMs: number; maxRequests: number }) {
  // Implementation using Redis or in-memory store
}
```

Apply to sensitive endpoints:

- `/api/time-registrations/toggle`: 10 requests/minute
- `/api/auth/*`: 5 requests/minute

### 8.5 Security Headers

Add security headers to all responses:

```typescript
const securityHeaders = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};
```

### 8.6 CORS Configuration

Configure in `astro.config.mjs`:

```javascript
export default defineConfig({
  server: {
    headers: {
      "Access-Control-Allow-Origin":
        process.env.ALLOWED_ORIGIN || "http://localhost:4321",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  },
});
```

---

## 9. Error Handling Strategy

### 9.1 Error Types

#### AppError Class

Custom error class for controlled errors:

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public message: string,
    public details?: Record<string, string>
  );
}
```

#### Error Categories

1. **Validation Errors** (422) - Zod validation failures
2. **Authentication Errors** (401) - Invalid/missing tokens or PINs
3. **Authorization Errors** (403) - Insufficient permissions
4. **Not Found Errors** (404) - Resource doesn't exist
5. **Conflict Errors** (409) - Duplicate/conflicting data
6. **Server Errors** (500) - Unexpected errors

### 9.2 Error Response Format

All errors follow consistent format:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details?: {
      field: "Specific error"
    }
  }
}
```

### 9.3 Error Logging

- Log all errors to console with stack traces
- Include request context (endpoint, method, user ID if available)
- Future: Send errors to monitoring service (Sentry, LogRocket)

### 9.4 Supabase Error Handling

Map common Supabase error codes to appropriate HTTP responses:

- `23505` (unique violation) → 409 Conflict
- `23503` (foreign key violation) → 400 Bad Request
- `PGRST116` (not found) → 404 Not Found

### 9.5 Zod Error Handling

Transform Zod errors into user-friendly messages:

```typescript
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
```

---

## 10. Implementation Steps

### Phase 1: Shared Infrastructure (Days 1-2)

#### Step 1.1: Setup Utilities

- [ ] Create `lib/utils/api-response.ts` with response helpers
- [ ] Create `lib/utils/error-handler.ts` with error handling
- [ ] Create `lib/utils/pagination.ts` with pagination helpers
- [ ] Create `lib/utils/password.ts` with bcrypt PIN hashing
- [ ] Install dependencies: `pnpm add bcryptjs zod && pnpm add -D @types/bcryptjs`

#### Step 1.2: Create Validators

- [ ] Create `lib/validators/common.validators.ts` with shared schemas
- [ ] Create `lib/validators/worker.validators.ts` with worker schemas
- [ ] Create `lib/validators/time-registration.validators.ts` with registration schemas

#### Step 1.3: Authentication Middleware

- [ ] Create `lib/middleware/auth.middleware.ts` with `requireAdmin()` function
- [ ] Test authentication with mock JWT token

### Phase 2: Worker Endpoints (Days 3-5)

#### Step 2.1: Worker Service

- [ ] Create `lib/services/worker.service.ts`
- [ ] Implement `listWorkers()` method
- [ ] Implement `getWorkerById()` method
- [ ] Implement `createWorker()` method
- [ ] Implement `updateWorker()` method
- [ ] Implement `updateWorkerPin()` method
- [ ] Implement `deactivateWorker()` method

#### Step 2.2: Worker Routes

- [ ] Create `src/pages/api/workers/index.ts` with GET and POST handlers
- [ ] Create `src/pages/api/workers/[id].ts` with GET, PATCH, DELETE handlers
- [ ] Create `src/pages/api/workers/[id]/pin.ts` with PATCH handler

#### Step 2.3: Testing

- [ ] Test all worker endpoints with Postman/Thunder Client
- [ ] Verify authentication checks work
- [ ] Verify validation errors are properly formatted
- [ ] Test edge cases (duplicate PIN, invalid UUIDs, etc.)

### Phase 3: Time Registration Endpoints - Worker (Days 6-7)

#### Step 3.1: Time Registration Service

- [ ] Create `lib/services/time-registration.service.ts`
- [ ] Implement `toggleCheckInOut()` method with PIN verification

#### Step 3.2: Toggle Route

- [ ] Create `src/pages/api/time-registrations/toggle.ts` with POST handler
- [ ] Test check-in functionality
- [ ] Test check-out functionality
- [ ] Verify PIN verification works correctly
- [ ] Test with invalid PIN, inactive worker

### Phase 4: Time Registration Endpoints - Admin (Days 8-10)

#### Step 4.1: Service Methods

- [ ] Implement `listTimeRegistrations()` method
- [ ] Implement `getTimeRegistrationById()` method
- [ ] Implement `createTimeRegistration()` method
- [ ] Implement `updateTimeRegistration()` method
- [ ] Implement `deleteTimeRegistration()` method

#### Step 4.2: Admin Routes

- [ ] Create `src/pages/api/admin/time-registrations/index.ts` with GET and POST handlers
- [ ] Create `src/pages/api/admin/time-registrations/[id].ts` with GET, PATCH, DELETE handlers

#### Step 4.3: Testing

- [ ] Test all time registration endpoints
- [ ] Verify manual_intervention flag is set correctly
- [ ] Verify modified_by_admin_id is populated
- [ ] Test validation rules (check_out > check_in, etc.)
- [ ] Test conflict detection (active registration already exists)

### Phase 5: Dashboard Endpoints (Days 11-12)

#### Step 5.1: Dashboard Service

- [ ] Create `lib/services/dashboard.service.ts`
- [ ] Implement `getDashboardStats()` method with aggregations
- [ ] Implement `getRecentEntries()` method

#### Step 5.2: Dashboard Routes

- [ ] Create `src/pages/api/admin/dashboard/stats.ts` with GET handler
- [ ] Create `src/pages/api/admin/dashboard/recent-entries.ts` with GET handler

#### Step 5.3: Testing

- [ ] Test dashboard stats with various date ranges
- [ ] Verify calculations are correct (percentages, averages)
- [ ] Test recent entries with different limits

### Phase 6: Security & Polish (Days 13-14)

#### Step 6.1: Security Enhancements

- [ ] Add security headers to all responses
- [ ] Configure CORS in `astro.config.mjs`
- [ ] Implement rate limiting (basic version)
- [ ] Review all authentication/authorization checks

#### Step 6.2: Error Handling Review

- [ ] Ensure all errors are caught and formatted correctly
- [ ] Add appropriate logging
- [ ] Test error scenarios for each endpoint

#### Step 6.3: Documentation

- [ ] Create API documentation (OpenAPI/Swagger spec)
- [ ] Document environment variables needed
- [ ] Create deployment guide

### Phase 7: Integration Testing (Days 15-16)

#### Step 7.1: End-to-End Testing

- [ ] Test complete worker lifecycle (create, update, deactivate)
- [ ] Test complete registration flow (check-in, check-out, admin edit)
- [ ] Test dashboard with real data
- [ ] Verify RLS policies work as expected

#### Step 7.2: Performance Testing

- [ ] Test pagination with large datasets
- [ ] Test dashboard queries with thousands of registrations
- [ ] Optimize slow queries if needed

#### Step 7.3: Final Review

- [ ] Code review and refactoring
- [ ] Security audit
- [ ] Performance optimization
- [ ] Prepare for deployment

---

## 11. Dependencies to Install

```bash
# Required dependencies
pnpm add bcryptjs zod

# Type definitions
pnpm add -D @types/bcryptjs

# Already installed (verify in package.json)
# - @supabase/supabase-js
# - astro
```

---

## 12. Environment Variables

Add to `.env`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
ALLOWED_ORIGIN=http://localhost:4321  # or production URL
```

---

## 13. Testing Strategy

### Manual Testing with Thunder Client/Postman

Create collections for:

1. **Worker Management**

   - List workers (various filters)
   - Get worker by ID
   - Create worker
   - Update worker
   - Update PIN
   - Deactivate worker

2. **Time Registration (Worker)**

   - Check-in
   - Check-out
   - Invalid PIN

3. **Time Registration (Admin)**

   - List registrations (various filters)
   - Get registration by ID
   - Manual check-in
   - Update registration
   - Delete registration

4. **Dashboard**
   - Get stats (various date ranges)
   - Get recent entries

### Automated Testing (Future)

Use Playwright or Vitest for:

- Unit tests for service methods
- Integration tests for API endpoints
- E2E tests for complete workflows

---

## 14. Notes and Best Practices

### Code Organization

- Keep route handlers thin - delegate to services
- Services handle business logic only
- Validators handle all input validation
- Utilities handle cross-cutting concerns

### Type Safety

- Use strict TypeScript configuration
- Leverage database types from Supabase
- Define clear DTOs for all API responses
- Use type guards for runtime type checking

### Performance

- Use database indexes for filtered/sorted fields
- Implement pagination for all list endpoints
- Consider caching for dashboard stats (future)
- Use Supabase select to fetch only needed fields

### Security

- Never expose sensitive data (PIN hashes)
- Always validate input before processing
- Use parameterized queries (Supabase handles this)
- Implement rate limiting on public endpoints
- Log security-relevant events

### Maintainability

- Write self-documenting code
- Add comments for complex business logic
- Follow consistent naming conventions
- Keep functions small and focused
- Update documentation when making changes

---

## 15. Deployment Checklist

Before deploying to production:

- [ ] All endpoints tested and working
- [ ] Environment variables configured
- [ ] CORS configured for production domain
- [ ] Rate limiting implemented
- [ ] Security headers added
- [ ] Error logging configured
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] Admin account(s) created in Supabase
- [ ] API documentation published
- [ ] Monitoring/alerting setup (optional)

---

## Summary

This implementation plan provides a complete roadmap for building all 14 REST API endpoints for TimeFly. The architecture emphasizes:

1. **Type Safety**: Leveraging TypeScript and Zod throughout
2. **Security**: JWT authentication, PIN hashing, RLS policies, input validation
3. **Maintainability**: Clear separation of concerns, reusable utilities
4. **Scalability**: Pagination, efficient queries, caching strategy
5. **Developer Experience**: Consistent patterns, clear error messages, comprehensive documentation

Follow the implementation steps sequentially, starting with shared infrastructure, then building endpoints in logical groups. Test thoroughly at each phase before moving forward.
