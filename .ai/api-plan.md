# REST API Plan - TimeFly

## 1. Resources

### Core Resources

- **Workers** - Employees who register their work time using PIN authentication

  - Database table: `workers`
  - Access: Admins (full CRUD), Workers (limited via PIN for time registration)

- **Time Registrations** - Records of check-in/check-out events

  - Database table: `time_registrations`
  - Access: Admins (full CRUD), Workers (create/update via PIN)

- **Admins** - System administrators who manage workers and registrations
  - Database tables: `admins` (extends `auth.users`)
  - Access: Admins (read/update own profile)

### Supporting Resources

- **Dashboard Stats** - Aggregated KPI metrics for administrative panel
  - Computed from: `time_registrations`, `workers`
  - Access: Admins only

## 2. Endpoints

### 2.1 Worker Endpoints

#### List Workers

- **Method:** GET
- **Path:** `/api/workers`
- **Description:** Retrieve paginated list of workers with optional filtering and sorting
- **Authentication:** Required (Admin only)
- **Query Parameters:**
  - `search` (string, optional) - Search by first_name or last_name (case-insensitive)
  - `department` (string, optional) - Filter by department
  - `is_active` (boolean, optional) - Filter by active status (default: true)
  - `page` (integer, optional) - Page number (default: 1)
  - `limit` (integer, optional) - Items per page (default: 20, max: 100)
  - `sort_by` (string, optional) - Sort field: 'first_name', 'last_name', 'created_at' (default: 'last_name')
  - `sort_order` (string, optional) - Sort direction: 'asc', 'desc' (default: 'asc')
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "workers": [
      {
        "id": "uuid-v4",
        "first_name": "Jane",
        "last_name": "Smith",
        "department": "Engineering",
        "is_active": true,
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 45,
      "total_pages": 3,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `422 Unprocessable Entity` - Invalid query parameters

#### Get Worker by ID

- **Method:** GET
- **Path:** `/api/workers/:id`
- **Description:** Retrieve detailed information about a specific worker
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Worker ID
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "first_name": "Jane",
    "last_name": "Smith",
    "department": "Engineering",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "stats": {
      "total_registrations": 245,
      "total_hours_worked": 1960.5,
      "average_daily_hours": 8.2
    }
  }
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Worker not found

#### Create Worker

- **Method:** POST
- **Path:** `/api/workers`
- **Description:** Create a new worker with PIN authentication
- **Authentication:** Required (Admin only)
- **Request Body:**

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "pin": "1234",
  "department": "Engineering",
  "is_active": true
}
```

- **Validation Rules:**
  - `first_name`: required, string, max 100 characters
  - `last_name`: required, string, max 100 characters
  - `pin`: required, string, exactly 4-6 digits
  - `department`: optional, string, max 100 characters
  - `is_active`: optional, boolean (default: true)
- **Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "first_name": "Jane",
    "last_name": "Smith",
    "department": "Engineering",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  },
  "message": "Worker created successfully"
}
```

- **Error Responses:**
  - `400 Bad Request` - Missing required fields or invalid data format
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `409 Conflict` - PIN already exists (PIN must be unique)
  - `422 Unprocessable Entity` - Validation errors

#### Update Worker

- **Method:** PATCH
- **Path:** `/api/workers/:id`
- **Description:** Update worker information (excluding PIN)
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Worker ID
- **Request Body:**

```json
{
  "first_name": "Jane",
  "last_name": "Smith-Johnson",
  "department": "Senior Engineering",
  "is_active": true
}
```

- **Validation Rules:** Same as Create Worker (all fields optional for PATCH)
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "first_name": "Jane",
    "last_name": "Smith-Johnson",
    "department": "Senior Engineering",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-10-07T14:20:00Z"
  },
  "message": "Worker updated successfully"
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid data format
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Worker not found
  - `422 Unprocessable Entity` - Validation errors

#### Update Worker PIN

- **Method:** PATCH
- **Path:** `/api/workers/:id/pin`
- **Description:** Update worker's PIN (separate endpoint for security)
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Worker ID
- **Request Body:**

```json
{
  "new_pin": "5678"
}
```

- **Validation Rules:**
  - `new_pin`: required, string, exactly 4-6 digits
- **Success Response (200 OK):**

```json
{
  "success": true,
  "message": "PIN updated successfully"
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid PIN format
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Worker not found
  - `409 Conflict` - PIN already in use

#### Deactivate Worker

- **Method:** DELETE
- **Path:** `/api/workers/:id`
- **Description:** Soft delete worker by setting is_active to false
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Worker ID
- **Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Worker deactivated successfully"
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Worker not found

### 2.2 Time Registration Endpoints (Worker Actions)

#### Check-in/Check-out Toggle

- **Method:** POST
- **Path:** `/api/time-registrations/toggle`
- **Description:** Worker check-in or check-out using PIN. Automatically determines action based on current state.
- **Authentication:** None (PIN-based)
- **Request Body:**

```json
{
  "pin": "1234"
}
```

- **Business Logic:**
  1. Verify PIN against workers.pin_hash
  2. Check if worker has active registration (status = 'in_progress')
  3. If no active registration: Create new registration with check_in timestamp
  4. If active registration exists: Update with check_out timestamp and status = 'completed'
- **Success Response - Check-in (201 Created):**

```json
{
  "success": true,
  "data": {
    "action": "check_in",
    "registration": {
      "id": "uuid-v4",
      "worker_id": "uuid-v4",
      "check_in": "2025-10-07T08:00:00Z",
      "check_out": null,
      "status": "in_progress",
      "manual_intervention": false
    },
    "worker": {
      "id": "uuid-v4",
      "first_name": "Jane",
      "last_name": "Smith"
    }
  },
  "message": "Check-in successful"
}
```

- **Success Response - Check-out (200 OK):**

```json
{
  "success": true,
  "data": {
    "action": "check_out",
    "registration": {
      "id": "uuid-v4",
      "worker_id": "uuid-v4",
      "check_in": "2025-10-07T08:00:00Z",
      "check_out": "2025-10-07T17:00:00Z",
      "status": "completed",
      "duration_hours": 9.0,
      "manual_intervention": false
    },
    "worker": {
      "id": "uuid-v4",
      "first_name": "Jane",
      "last_name": "Smith"
    }
  },
  "message": "Check-out successful"
}
```

- **Error Responses:**
  - `400 Bad Request` - Missing PIN
  - `401 Unauthorized` - Invalid PIN
  - `404 Not Found` - Worker not found or inactive
  - `500 Internal Server Error` - Server error

### 2.3 Time Registration Endpoints (Admin Actions)

#### List Time Registrations

- **Method:** GET
- **Path:** `/api/admin/time-registrations`
- **Description:** Retrieve paginated list of time registrations with filtering options
- **Authentication:** Required (Admin only)
- **Query Parameters:**
  - `worker_id` (UUID, optional) - Filter by specific worker
  - `status` (string, optional) - Filter by status: 'in_progress', 'completed'
  - `manual_intervention` (boolean, optional) - Filter by manual intervention flag
  - `date_from` (ISO date, optional) - Filter registrations from this date (check_in >= date_from)
  - `date_to` (ISO date, optional) - Filter registrations until this date (check_in <= date_to)
  - `page` (integer, optional) - Page number (default: 1)
  - `limit` (integer, optional) - Items per page (default: 20, max: 100)
  - `sort_by` (string, optional) - Sort field: 'check_in', 'check_out', 'created_at' (default: 'check_in')
  - `sort_order` (string, optional) - Sort direction: 'asc', 'desc' (default: 'desc')
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "id": "uuid-v4",
        "worker_id": "uuid-v4",
        "worker": {
          "id": "uuid-v4",
          "first_name": "Jane",
          "last_name": "Smith",
          "department": "Engineering"
        },
        "check_in": "2025-10-07T08:00:00Z",
        "check_out": "2025-10-07T17:00:00Z",
        "duration_hours": 9.0,
        "status": "completed",
        "manual_intervention": false,
        "modified_by_admin_id": null,
        "notes": null,
        "created_at": "2025-10-07T08:00:00Z",
        "updated_at": "2025-10-07T17:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 245,
      "total_pages": 13,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `422 Unprocessable Entity` - Invalid query parameters

#### Get Time Registration by ID

- **Method:** GET
- **Path:** `/api/admin/time-registrations/:id`
- **Description:** Retrieve detailed information about a specific time registration
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Registration ID
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "worker_id": "uuid-v4",
    "worker": {
      "id": "uuid-v4",
      "first_name": "Jane",
      "last_name": "Smith",
      "department": "Engineering"
    },
    "check_in": "2025-10-07T08:00:00Z",
    "check_out": "2025-10-07T17:00:00Z",
    "duration_hours": 9.0,
    "status": "completed",
    "manual_intervention": true,
    "modified_by_admin_id": "admin-uuid",
    "modified_by_admin": {
      "id": "admin-uuid",
      "first_name": "John",
      "last_name": "Doe"
    },
    "notes": "Corrected check-out time",
    "created_at": "2025-10-07T08:00:00Z",
    "updated_at": "2025-10-07T17:15:00Z"
  }
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Registration not found

#### Create Time Registration (Manual Check-in)

- **Method:** POST
- **Path:** `/api/admin/time-registrations`
- **Description:** Admin manually creates a time registration (check-in) for a worker
- **Authentication:** Required (Admin only)
- **Request Body:**

```json
{
  "worker_id": "uuid-v4",
  "check_in": "2025-10-07T08:00:00Z",
  "notes": "Manual check-in due to system issue"
}
```

- **Validation Rules:**
  - `worker_id`: required, valid UUID, worker must exist and be active
  - `check_in`: required, valid ISO 8601 timestamp
  - `notes`: optional, string, max 1000 characters
- **Business Logic:**
  - Sets `manual_intervention` = true
  - Sets `modified_by_admin_id` via database trigger
  - Validates that worker doesn't have another in_progress registration
- **Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "worker_id": "uuid-v4",
    "check_in": "2025-10-07T08:00:00Z",
    "check_out": null,
    "status": "in_progress",
    "manual_intervention": true,
    "modified_by_admin_id": "admin-uuid",
    "notes": "Manual check-in due to system issue",
    "created_at": "2025-10-07T14:30:00Z",
    "updated_at": "2025-10-07T14:30:00Z"
  },
  "message": "Time registration created successfully"
}
```

- **Error Responses:**
  - `400 Bad Request` - Missing required fields or invalid data format
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Worker not found
  - `409 Conflict` - Worker already has an active (in_progress) registration
  - `422 Unprocessable Entity` - Validation errors

#### Update Time Registration

- **Method:** PATCH
- **Path:** `/api/admin/time-registrations/:id`
- **Description:** Admin updates time registration (manual check-out or edit existing registration)
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Registration ID
- **Request Body:**

```json
{
  "check_in": "2025-10-07T08:00:00Z",
  "check_out": "2025-10-07T17:00:00Z",
  "status": "completed",
  "notes": "Corrected times based on security logs"
}
```

- **Validation Rules:**
  - `check_in`: optional, valid ISO 8601 timestamp
  - `check_out`: optional, valid ISO 8601 timestamp, must be > check_in
  - `status`: optional, must be 'in_progress' or 'completed'
  - `notes`: optional, string, max 1000 characters
- **Business Logic:**
  - Sets `manual_intervention` = true
  - Sets `modified_by_admin_id` via database trigger
  - Validates check_out > check_in constraint
  - Auto-completes status if check_out is provided
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "worker_id": "uuid-v4",
    "check_in": "2025-10-07T08:00:00Z",
    "check_out": "2025-10-07T17:00:00Z",
    "duration_hours": 9.0,
    "status": "completed",
    "manual_intervention": true,
    "modified_by_admin_id": "admin-uuid",
    "notes": "Corrected times based on security logs",
    "created_at": "2025-10-07T08:00:00Z",
    "updated_at": "2025-10-07T14:30:00Z"
  },
  "message": "Time registration updated successfully"
}
```

- **Error Responses:**
  - `400 Bad Request` - Invalid data format or check_out <= check_in
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Registration not found
  - `422 Unprocessable Entity` - Validation errors

#### Delete Time Registration

- **Method:** DELETE
- **Path:** `/api/admin/time-registrations/:id`
- **Description:** Admin permanently deletes a time registration
- **Authentication:** Required (Admin only)
- **Path Parameters:**
  - `id` (UUID, required) - Registration ID
- **Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Time registration deleted successfully"
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `404 Not Found` - Registration not found

### 2.5 Dashboard & Analytics Endpoints

#### Get Dashboard Statistics

- **Method:** GET
- **Path:** `/api/admin/dashboard/stats`
- **Description:** Retrieve aggregated KPI metrics for administrative dashboard
- **Authentication:** Required (Admin only)
- **Query Parameters:**
  - `date_from` (ISO date, optional) - Calculate stats from this date (default: 30 days ago)
  - `date_to` (ISO date, optional) - Calculate stats until this date (default: today)
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "time_period": {
      "from": "2025-09-07T00:00:00Z",
      "to": "2025-10-07T23:59:59Z"
    },
    "registrations": {
      "total": 245,
      "completed": 240,
      "in_progress": 5,
      "manual_interventions": 12,
      "manual_intervention_rate": 4.9
    },
    "workers": {
      "total": 50,
      "active": 48,
      "inactive": 2,
      "with_active_registration": 5
    },
    "work_hours": {
      "total_hours": 1960.5,
      "average_per_registration": 8.17,
      "average_per_worker": 40.8
    },
    "performance": {
      "average_registration_time_seconds": 2.3,
      "successful_registrations_rate": 97.96
    },
    "recent_activity": {
      "today_registrations": 12,
      "today_hours": 96.5
    }
  }
}
```

- **Error Responses:**
  - `401 Unauthorized` - Missing or invalid authentication token
  - `403 Forbidden` - User is not an admin
  - `422 Unprocessable Entity` - Invalid date parameters

#### Get Recent Time Entries

- **Method:** GET
- **Path:** `/api/admin/dashboard/recent-entries`
- **Description:** Retrieve recent time registration entries for dashboard display
- **Authentication:** Required (Admin only)
- **Query Parameters:**
  - `limit` (integer, optional) - Number of entries to return (default: 10, max: 50)
- **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid-v4",
        "worker": {
          "id": "uuid-v4",
          "first_name": "Jane",
          "last_name": "Smith"
        },
        "check_in": "2025-10-07T08:00:00Z",
        "check_out": "2025-10-07T17:00:00Z",
        "duration_hours": 9.0,
        "status": "completed",
        "manual_intervention": false,
        "created_at": "2025-10-07T08:00:00Z"
      }
    ]
  }
}
```

## 3. Authentication and Authorization

### 3.1 Admin Authentication (Supabase Auth)

**Implementation:**

- Admins authenticate using email/password through Supabase Auth
- Supabase manages the `auth.users` table automatically
- Upon successful authentication, Supabase returns JWT access token and refresh token
- Access tokens are included in request headers as `Authorization: Bearer <token>`
- Tokens are validated by Supabase middleware on each request
- Admin profile data is stored in `admins` table, linked to `auth.users` via `user_id`

**Authentication Flow:**

1. Client sends POST to `/api/auth/login` with email and password
2. Supabase Auth validates credentials
3. On success, returns session with access_token and refresh_token
4. Client stores tokens (secure HTTP-only cookies recommended)
5. Client includes access_token in Authorization header for subsequent requests
6. Middleware validates token and retrieves admin profile from `admins` table
7. RLS policies ensure admins can only access authorized data

**Token Management:**

- Access tokens expire after 1 hour (configurable in Supabase)
- Refresh tokens can be used to obtain new access tokens
- Implement automatic token refresh on client side
- Logout invalidates both access and refresh tokens

### 3.2 Worker Authentication (PIN-based)

**Implementation:**

- Workers do not have accounts in `auth.users` table
- Authentication is PIN-based for time registration only
- PIN is hashed using bcrypt (or similar) and stored as `pin_hash` in `workers` table
- PIN must be unique across all workers
- PIN verification happens server-side during check-in/check-out

**PIN Verification Flow:**

1. Worker enters PIN on check-in/check-out interface
2. Client sends POST to `/api/time-registrations/toggle` with PIN in request body
3. Server queries `workers` table to find matching `pin_hash`
4. If found and worker is active, process check-in or check-out
5. If not found or worker inactive, return 401 Unauthorized error
6. No session or token is created - each action requires PIN verification

**Security Considerations:**

- PINs should be 4-6 digits for balance between security and usability
- Implement rate limiting on PIN verification endpoint (max 5 attempts per minute per IP)
- Log failed PIN attempts for security monitoring
- PINs are never returned in API responses
- Consider implementing temporary PIN lockout after multiple failed attempts (future enhancement)

### 3.3 Authorization Rules (RLS Policies)

**Admins Table:**

- Admins can view their own profile data only (`user_id = auth.uid()`)
- Admins can update their own profile data only
- No admin can view or modify other admins' profiles

**Workers Table:**

- Only authenticated admins can perform CRUD operations on workers
- Workers themselves cannot access this table directly via API
- RLS policy: `EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())`

**Time Registrations Table:**

- Only authenticated admins can read, update, and delete registrations
- Workers can create/update registrations only via PIN-based `/toggle` endpoint
- RLS policy for admin access: `EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())`
- Worker PIN verification bypasses RLS using service role for specific operations

### 3.4 API Security Headers

All API responses should include the following security headers:

```
Content-Type: application/json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 3.5 Rate Limiting

Implement rate limiting to prevent abuse:

- **PIN verification endpoint** (`/api/time-registrations/toggle`):
  - 10 requests per minute per IP address
  - 50 requests per hour per IP address
- **Admin authentication** (`/api/auth/login`):
  - 5 requests per minute per IP address
  - 10 failed attempts per hour per email address
- **Other authenticated endpoints**:
  - 100 requests per minute per authenticated user
  - 1000 requests per hour per authenticated user

### 3.6 CORS Configuration

Configure CORS based on deployment environment:

- **Development:** Allow `http://localhost:*`
- **Production:** Allow only verified frontend domain(s)
- Allowed methods: GET, POST, PATCH, DELETE, OPTIONS
- Allowed headers: Authorization, Content-Type
- Credentials: true (for cookie-based authentication)

## 4. Validation and Business Logic

### 4.1 Workers Resource Validation

**Field Validations:**

| Field      | Type    | Required        | Constraints              | Error Message                                           |
| ---------- | ------- | --------------- | ------------------------ | ------------------------------------------------------- |
| first_name | string  | Yes             | Max 100 chars, non-empty | "First name is required and must be max 100 characters" |
| last_name  | string  | Yes             | Max 100 chars, non-empty | "Last name is required and must be max 100 characters"  |
| pin        | string  | Yes (on create) | 4-6 digits, unique       | "PIN must be 4-6 digits and unique"                     |
| department | string  | No              | Max 100 chars            | "Department must be max 100 characters"                 |
| is_active  | boolean | No              | true/false               | "is_active must be a boolean value"                     |

**Business Rules:**

1. **Unique PIN Constraint:**

   - PIN must be unique across all workers (active and inactive)
   - PIN is hashed before storage using bcrypt with salt rounds = 10
   - Validation error if PIN already exists: `409 Conflict`

2. **Active Worker Rules:**

   - A worker can be deactivated (is_active = false) but not permanently deleted
   - Deactivated workers cannot perform check-in/check-out
   - Deactivated workers are excluded from default listings (unless explicitly filtered)

3. **Worker Deletion:**
   - DELETE endpoint performs soft delete (sets is_active = false)
   - Hard deletion is not allowed via API (data retention policy)

### 4.2 Time Registrations Resource Validation

**Field Validations:**

| Field     | Type      | Required | Constraints                                  | Error Message                                        |
| --------- | --------- | -------- | -------------------------------------------- | ---------------------------------------------------- |
| worker_id | UUID      | Yes      | Valid UUID, worker must exist and be active  | "Invalid worker ID or worker is inactive"            |
| check_in  | timestamp | Yes      | Valid ISO 8601 timestamp                     | "Check-in time must be a valid timestamp"            |
| check_out | timestamp | No       | Valid ISO 8601 timestamp, must be > check_in | "Check-out time must be after check-in time"         |
| status    | string    | Yes      | Must be 'in_progress' or 'completed'         | "Status must be either 'in_progress' or 'completed'" |
| notes     | text      | No       | Max 1000 characters                          | "Notes must be max 1000 characters"                  |

**Business Rules:**

1. **Check-in Rules:**

   - Worker can only have ONE active (in_progress) registration at a time
   - Before creating new registration, system checks for existing in_progress registrations
   - If active registration exists, return `409 Conflict` with message: "Worker already has an active registration"
   - Check-in timestamp defaults to current time if not specified

2. **Check-out Rules:**

   - Check-out can only be performed on existing in_progress registration
   - Check-out timestamp must be greater than check-in timestamp (enforced by CHECK constraint)
   - Upon check-out, status automatically changes to 'completed'
   - Duration is calculated as: `(check_out - check_in) in hours`

3. **Status Management:**

   - Status is automatically set based on check_out value:
     - If check_out is NULL → status = 'in_progress'
     - If check_out is NOT NULL → status = 'completed'
   - Manual status changes are allowed by admins but must be consistent with check_out value

4. **Manual Intervention Tracking:**

   - `manual_intervention` flag is automatically set to true when admin creates/modifies registration
   - `modified_by_admin_id` is automatically populated via database trigger when manual_intervention changes from false to true
   - This tracking enables audit trails and reporting on admin interventions

5. **Timestamp Validation:**

   - All timestamps are stored in UTC
   - Timestamps cannot be in the future (validation on create/update)
   - Timestamps must be reasonable (not older than 1 year for check-in)

6. **Cascade Deletion:**
   - If worker is hard-deleted (database level), all their time_registrations are cascade deleted
   - If admin is deleted, their modified_by_admin_id is set to NULL (SET NULL constraint)

### 4.3 Dashboard Statistics Business Logic

**Calculation Rules:**

1. **Total Registrations:**

   - Count all time_registrations within specified date range
   - Filter by check_in timestamp

2. **Successful Registrations Rate:**

   - Formula: `(completed_registrations / total_registrations) * 100`
   - Completed = status is 'completed'

3. **Average Registration Duration:**

   - Formula: `SUM(check_out - check_in) / COUNT(completed_registrations)`
   - Only includes completed registrations
   - Result in hours with 2 decimal precision

4. **Manual Intervention Rate:**

   - Formula: `(registrations_with_manual_intervention / total_registrations) * 100`
   - Helps track admin workload and system reliability

5. **Active Workers Count:**

   - Count workers where is_active = true

6. **Workers with Active Registration:**
   - Count workers who have in_progress registration

### 4.4 Error Response Format

All error responses follow consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific validation error"
    }
  }
}
```

**Common Error Codes:**

| HTTP Status | Error Code            | Description                                                                            |
| ----------- | --------------------- | -------------------------------------------------------------------------------------- |
| 400         | BAD_REQUEST           | Invalid request format or missing required fields                                      |
| 401         | UNAUTHORIZED          | Missing or invalid authentication credentials                                          |
| 403         | FORBIDDEN             | User lacks permission for requested action                                             |
| 404         | NOT_FOUND             | Requested resource does not exist                                                      |
| 409         | CONFLICT              | Request conflicts with current state (e.g., duplicate PIN, active registration exists) |
| 422         | UNPROCESSABLE_ENTITY  | Validation errors on input data                                                        |
| 429         | TOO_MANY_REQUESTS     | Rate limit exceeded                                                                    |
| 500         | INTERNAL_SERVER_ERROR | Unexpected server error                                                                |

### 4.5 Pagination Logic

All list endpoints support pagination with consistent behavior:

**Default Values:**

- `page`: 1
- `limit`: 20
- `max_limit`: 100

**Response Metadata:**

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 245,
    "total_pages": 13,
    "has_next": true,
    "has_previous": false
  }
}
```

**Calculation:**

- `total_pages` = CEIL(total_items / limit)
- `has_next` = page < total_pages
- `has_previous` = page > 1

### 4.6 Sorting and Filtering Logic

**Sorting:**

- Default sort order varies by resource (documented in endpoint descriptions)
- All timestamp fields can be sorted in ascending or descending order
- Text fields (names, departments) use case-insensitive collation

**Filtering:**

- Text search uses case-insensitive pattern matching (ILIKE in PostgreSQL)
- Date filters are inclusive (date_from <= check_in <= date_to)
- Boolean filters match exact values
- Multiple filters are combined with AND logic

**Performance Considerations:**

- All filter and sort fields are indexed in database
- Use database-level filtering to minimize data transfer
- Implement query optimization for large datasets

## 5. Additional Implementation Notes

### 5.1 Timestamps and Timezone Handling

- All timestamps are stored and returned in ISO 8601 format with UTC timezone
- Client applications are responsible for converting to local timezone for display
- Example: `2025-10-07T14:30:00Z` (Z indicates UTC)

### 5.2 Data Consistency

- Use database transactions for operations that modify multiple tables
- Implement optimistic locking for concurrent updates (using updated_at timestamp)
- Database triggers handle automatic field population (modified_by_admin_id, updated_at)

### 5.3 Logging and Monitoring

- Log all admin actions (create, update, delete operations) with timestamp and admin_id
- Log failed PIN attempts with IP address and timestamp
- Track API response times for performance monitoring
- Implement health check endpoint: `GET /api/health`

### 5.4 API Versioning

- Current version: v1 (implicit, no version in URL)
- Future versions will use URL prefix: `/api/v2/...`
- Maintain backward compatibility for at least one major version

### 5.5 Assumptions

1. PIN length of 4-6 digits is sufficient security for MVP
2. Time registrations older than 1 year are archived (not in MVP scope)
3. Single timezone operation (UTC for storage, local conversion on client)
4. No concurrent check-in for same worker (enforced by business logic)
5. Admin management (create/delete admins) is handled outside API (direct database access or future admin-admin endpoints)
6. System monitoring and URL anomaly detection are separate services consuming this API
