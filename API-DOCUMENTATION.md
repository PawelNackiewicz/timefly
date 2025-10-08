# TimeFly REST API - Dokumentacja

## 📋 Spis treści

1. [Przegląd](#przegląd)
2. [Instalacja](#instalacja)
3. [Konfiguracja](#konfiguracja)
4. [Architektura](#architektura)
5. [Endpointy API](#endpointy-api)
6. [Bezpieczeństwo](#bezpieczeństwo)
7. [Obsługa błędów](#obsługa-błędów)
8. [Przykłady użycia](#przykłady-użycia)

---

## Przegląd

TimeFly REST API to kompletny system zarządzania czasem pracy pracowników z dwupoziomowym systemem uwierzytelniania:

- **Pracownicy (Workers)**: Autentykacja PIN-based (4-6 cyfr)
- **Administratorzy (Admins)**: Autentykacja JWT przez Supabase Auth

### Technologie

- **Framework**: Astro 5 z Server Endpoints
- **Język**: TypeScript 5
- **Baza danych**: Supabase (PostgreSQL)
- **Walidacja**: Zod schemas
- **Bezpieczeństwo**: bcrypt (PIN hashing), RLS policies

### Statystyki

- ✅ **14 endpointów** REST API
- ✅ **3 serwisy biznesowe** (Worker, TimeRegistration, Dashboard)
- ✅ **Pełna walidacja** Zod dla wszystkich wejść
- ✅ **Kompleksowa obsługa błędów**
- ✅ **Type-safe** dzięki TypeScript

---

## Instalacja

### 1. Zainstaluj wymaganą zależność

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

lub

```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

### 2. Struktura projektu

```
src/
├── lib/
│   ├── services/              # Logika biznesowa
│   │   ├── worker.service.ts
│   │   ├── time-registration.service.ts
│   │   └── dashboard.service.ts
│   ├── validators/            # Schematy Zod
│   │   ├── common.validators.ts
│   │   ├── worker.validators.ts
│   │   └── time-registration.validators.ts
│   ├── utils/                 # Narzędzia pomocnicze
│   │   ├── api-response.ts
│   │   ├── error-handler.ts
│   │   ├── pagination.ts
│   │   └── password.ts
│   └── middleware/            # Middleware
│       └── auth.middleware.ts
│
└── pages/
    └── api/
        ├── workers/           # Zarządzanie pracownikami
        │   ├── index.ts
        │   ├── [id].ts
        │   └── [id]/
        │       └── pin.ts
        ├── time-registrations/  # Rejestracja czasu (worker)
        │   └── toggle.ts
        └── admin/
            ├── time-registrations/  # Admin: zarządzanie rejestracjami
            │   ├── index.ts
            │   └── [id].ts
            └── dashboard/           # Admin: statystyki
                ├── stats.ts
                └── recent-entries.ts
```

---

## Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env` w katalogu głównym:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# CORS Configuration
ALLOWED_ORIGIN=http://localhost:4321
```

**Dla produkcji:**

- Ustaw `ALLOWED_ORIGIN` na domenę produkcyjną
- Upewnij się, że `SUPABASE_KEY` jest kluczem anon (nie service role)

---

## Architektura

### Request Flow

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

### Warstwy aplikacji

1. **Route Handlers** - Parsowanie żądań, autentykacja, formatowanie odpowiedzi
2. **Service Layer** - Logika biznesowa, walidacja danych, transformacje
3. **Database Layer** - Zapytania Supabase z RLS policies
4. **Validators** - Schematy Zod dla wszystkich wejść
5. **Utils** - Funkcje pomocnicze (response formatting, error handling, pagination)

---

## Endpointy API

### 📊 Podsumowanie

| Kategoria             | Endpoint                              | Metoda | Auth      | Opis                    |
| --------------------- | ------------------------------------- | ------ | --------- | ----------------------- |
| **Workers**           | `/api/workers`                        | GET    | Admin JWT | Lista pracowników       |
|                       | `/api/workers`                        | POST   | Admin JWT | Utwórz pracownika       |
|                       | `/api/workers/:id`                    | GET    | Admin JWT | Szczegóły pracownika    |
|                       | `/api/workers/:id`                    | PATCH  | Admin JWT | Aktualizuj pracownika   |
|                       | `/api/workers/:id`                    | DELETE | Admin JWT | Deaktywuj pracownika    |
|                       | `/api/workers/:id/pin`                | PATCH  | Admin JWT | Zmień PIN               |
| **Time Registration** | `/api/time-registrations/toggle`      | POST   | PIN       | Check-in/out pracownika |
| **Admin Time Reg**    | `/api/admin/time-registrations`       | GET    | Admin JWT | Lista rejestracji       |
|                       | `/api/admin/time-registrations`       | POST   | Admin JWT | Utwórz rejestrację      |
|                       | `/api/admin/time-registrations/:id`   | GET    | Admin JWT | Szczegóły rejestracji   |
|                       | `/api/admin/time-registrations/:id`   | PATCH  | Admin JWT | Aktualizuj rejestrację  |
|                       | `/api/admin/time-registrations/:id`   | DELETE | Admin JWT | Usuń rejestrację        |
| **Dashboard**         | `/api/admin/dashboard/stats`          | GET    | Admin JWT | Statystyki KPI          |
|                       | `/api/admin/dashboard/recent-entries` | GET    | Admin JWT | Ostatnie wpisy          |

---

## Szczegółowy opis endpointów

### 1. Workers API

#### GET `/api/workers`

**Lista pracowników z filtrowaniem i paginacją**

**Auth**: Admin JWT (Bearer token)

**Query Parameters**:

```typescript
{
  search?: string,          // Szukaj po first_name lub last_name
  department?: string,      // Filtruj po dziale
  is_active?: boolean,      // Filtruj po statusie (default: true)
  page?: number,            // Numer strony (default: 1)
  limit?: number,           // Elementów na stronę (default: 20, max: 100)
  sort_by?: string,         // 'first_name' | 'last_name' | 'created_at'
  sort_order?: string       // 'asc' | 'desc' (default: 'asc')
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "workers": [
      {
        "id": "uuid",
        "first_name": "Jan",
        "last_name": "Kowalski",
        "department": "Produkcja",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
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

---

#### POST `/api/workers`

**Utwórz nowego pracownika**

**Auth**: Admin JWT

**Request Body**:

```json
{
  "first_name": "Jan",
  "last_name": "Kowalski",
  "pin": "1234", // 4-6 cyfr
  "department": "Produkcja", // opcjonalne
  "is_active": true // opcjonalne (default: true)
}
```

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "department": "Produkcja",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  "message": "Worker created successfully"
}
```

**Errors**:

- `409 Conflict` - PIN już istnieje
- `422 Unprocessable Entity` - Błędy walidacji

---

#### GET `/api/workers/:id`

**Pobierz szczegóły pracownika ze statystykami**

**Auth**: Admin JWT

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "department": "Produkcja",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "stats": {
      "total_registrations": 45,
      "total_hours_worked": 360.5,
      "average_daily_hours": 8.01
    }
  }
}
```

---

#### PATCH `/api/workers/:id`

**Aktualizuj dane pracownika (bez PIN)**

**Auth**: Admin JWT

**Request Body** (wszystkie pola opcjonalne):

```json
{
  "first_name": "Jan",
  "last_name": "Nowak",
  "department": "Magazyn",
  "is_active": false
}
```

**Response**: `200 OK`

---

#### PATCH `/api/workers/:id/pin`

**Zmień PIN pracownika**

**Auth**: Admin JWT

**Request Body**:

```json
{
  "new_pin": "5678" // 4-6 cyfr
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "PIN updated successfully"
}
```

**Errors**:

- `409 Conflict` - PIN już w użyciu

---

#### DELETE `/api/workers/:id`

**Deaktywuj pracownika (soft delete)**

**Auth**: Admin JWT

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "Worker deactivated successfully"
}
```

---

### 2. Time Registration API (Worker)

#### POST `/api/time-registrations/toggle`

**Check-in lub check-out pracownika**

**Auth**: BRAK (autentykacja PIN)

**Request Body**:

```json
{
  "pin": "1234" // 4-6 cyfr
}
```

**Response (Check-in)**: `201 Created`

```json
{
  "success": true,
  "data": {
    "action": "check_in",
    "registration": {
      "id": "uuid",
      "worker_id": "uuid",
      "check_in": "2025-01-08T08:00:00Z",
      "check_out": null,
      "status": "in_progress",
      "manual_intervention": false
    },
    "worker": {
      "id": "uuid",
      "first_name": "Jan",
      "last_name": "Kowalski"
    }
  },
  "message": "Check-in successful"
}
```

**Response (Check-out)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "action": "check_out",
    "registration": {
      "id": "uuid",
      "worker_id": "uuid",
      "check_in": "2025-01-08T08:00:00Z",
      "check_out": "2025-01-08T16:00:00Z",
      "status": "completed",
      "manual_intervention": false,
      "duration_hours": 8.0
    },
    "worker": {
      "id": "uuid",
      "first_name": "Jan",
      "last_name": "Kowalski"
    }
  },
  "message": "Check-out successful"
}
```

**Errors**:

- `401 Unauthorized` - Nieprawidłowy PIN
- `404 Not Found` - Pracownik nieaktywny

---

### 3. Admin Time Registration API

#### GET `/api/admin/time-registrations`

**Lista rejestracji czasu z filtrowaniem**

**Auth**: Admin JWT

**Query Parameters**:

```typescript
{
  worker_id?: string,           // UUID pracownika
  status?: string,              // 'in_progress' | 'completed'
  manual_intervention?: boolean, // Filtruj po interwencjach manualnych
  date_from?: string,           // ISO date (np. '2025-01-01')
  date_to?: string,             // ISO date
  page?: number,
  limit?: number,
  sort_by?: string,             // 'check_in' | 'check_out' | 'created_at'
  sort_order?: string           // 'asc' | 'desc' (default: 'desc')
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "id": "uuid",
        "worker_id": "uuid",
        "check_in": "2025-01-08T08:00:00Z",
        "check_out": "2025-01-08T16:00:00Z",
        "status": "completed",
        "manual_intervention": false,
        "duration_hours": 8.0,
        "notes": null,
        "created_at": "2025-01-08T08:00:00Z",
        "worker": {
          "id": "uuid",
          "first_name": "Jan",
          "last_name": "Kowalski",
          "department": "Produkcja"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### POST `/api/admin/time-registrations`

**Manualne utworzenie rejestracji**

**Auth**: Admin JWT

**Request Body**:

```json
{
  "worker_id": "uuid",
  "check_in": "2025-01-08T08:00:00Z",
  "notes": "Poprawka z powodu awarii systemu" // opcjonalne
}
```

**Response**: `201 Created`

**Errors**:

- `400 Bad Request` - check_in w przyszłości
- `404 Not Found` - Pracownik nie istnieje
- `409 Conflict` - Pracownik ma już aktywną rejestrację

---

#### GET `/api/admin/time-registrations/:id`

**Szczegóły rejestracji**

**Auth**: Admin JWT

**Response**: `200 OK` (zawiera worker + modified_by_admin)

---

#### PATCH `/api/admin/time-registrations/:id`

**Aktualizuj rejestrację**

**Auth**: Admin JWT

**Request Body** (wszystkie pola opcjonalne):

```json
{
  "check_in": "2025-01-08T08:00:00Z",
  "check_out": "2025-01-08T16:00:00Z",
  "status": "completed",
  "notes": "Poprawiono czas"
}
```

**Response**: `200 OK`

**Uwaga**: Automatycznie ustawia `manual_intervention = true` i `status = 'completed'` gdy podano `check_out`.

**Errors**:

- `400 Bad Request` - check_out <= check_in

---

#### DELETE `/api/admin/time-registrations/:id`

**Usuń rejestrację (hard delete)**

**Auth**: Admin JWT

**Response**: `200 OK`

---

### 4. Dashboard API

#### GET `/api/admin/dashboard/stats`

**Kompleksowe statystyki KPI**

**Auth**: Admin JWT

**Query Parameters**:

```typescript
{
  date_from?: string,  // ISO date (default: 30 dni temu)
  date_to?: string     // ISO date (default: dzisiaj)
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "time_period": {
      "from": "2024-12-09T00:00:00Z",
      "to": "2025-01-08T00:00:00Z"
    },
    "registrations": {
      "total": 450,
      "completed": 445,
      "in_progress": 5,
      "manual_interventions": 12,
      "manual_intervention_rate": 2.67
    },
    "workers": {
      "total": 50,
      "active": 48,
      "inactive": 2,
      "with_active_registration": 5
    },
    "work_hours": {
      "total_hours": 3560.5,
      "average_per_registration": 8.0,
      "average_per_worker": 74.18
    },
    "performance": {
      "average_registration_time_seconds": 2.3,
      "successful_registrations_rate": 98.89
    },
    "recent_activity": {
      "today_registrations": 15,
      "today_hours": 120.0
    }
  }
}
```

---

#### GET `/api/admin/dashboard/recent-entries`

**Ostatnie wpisy rejestracji**

**Auth**: Admin JWT

**Query Parameters**:

```typescript
{
  limit?: number  // 1-50 (default: 10)
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "worker": {
          "id": "uuid",
          "first_name": "Jan",
          "last_name": "Kowalski"
        },
        "check_in": "2025-01-08T08:00:00Z",
        "check_out": "2025-01-08T16:00:00Z",
        "duration_hours": 8.0,
        "status": "completed",
        "manual_intervention": false,
        "created_at": "2025-01-08T08:00:00Z"
      }
    ]
  }
}
```

---

## Bezpieczeństwo

### Autentykacja

#### Admin Authentication (JWT)

1. Admin loguje się przez Supabase Auth
2. Otrzymuje JWT access token
3. Dołącza token w nagłówku: `Authorization: Bearer <token>`
4. Serwer waliduje token przez `supabase.auth.getUser(token)`
5. Weryfikuje czy użytkownik jest w tabeli `admins`

#### Worker Authentication (PIN)

1. Pracownik wprowadza PIN (4-6 cyfr)
2. Serwer pobiera wszystkich pracowników z hash'ami
3. Weryfikuje PIN przeciwko każdemu hash'owi (bcrypt.compare)
4. Jeśli dopasowanie znaleziono - akcja zatwierdzona
5. Brak sesji/tokenu - każda akcja wymaga PIN

### Hashowanie PIN

- Algorytm: **bcrypt**
- Salt rounds: **10**
- PIN nie są przechowywane w plain text
- PIN są usuwane z wszystkich odpowiedzi API

### Row Level Security (RLS)

Wszystkie zapytania respektują RLS policies:

- `admins` - użytkownicy mogą widzieć tylko swój profil
- `workers` - dostęp tylko dla uwierzytelnionych adminów
- `time_registrations` - dostęp tylko dla uwierzytelnionych adminów

### Rate Limiting

⚠️ **Do zaimplementowania w produkcji**:

- `/api/time-registrations/toggle`: 10 requests/minute per IP
- Inne endpointy admin: standardowe limity

---

## Obsługa błędów

### Format odpowiedzi błędu

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      "field": "Specific error"
    }
  }
}
```

### Kody błędów

| Kod HTTP | Error Code            | Opis                             |
| -------- | --------------------- | -------------------------------- |
| 400      | BAD_REQUEST           | Nieprawidłowe dane wejściowe     |
| 401      | UNAUTHORIZED          | Brak lub nieprawidłowy token/PIN |
| 403      | FORBIDDEN             | Brak uprawnień (nie admin)       |
| 404      | NOT_FOUND             | Zasób nie znaleziony             |
| 409      | CONFLICT              | Konflikt danych (duplikat PIN)   |
| 422      | UNPROCESSABLE_ENTITY  | Błędy walidacji Zod              |
| 500      | INTERNAL_SERVER_ERROR | Nieoczekiwany błąd               |

### Przykłady błędów

**Błąd walidacji (422)**:

```json
{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Validation failed",
    "details": {
      "pin": "PIN must be 4-6 digits",
      "first_name": "First name is required"
    }
  }
}
```

**Konflikt PIN (409)**:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "PIN already exists"
  }
}
```

**Nieprawidłowy PIN (401)**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid PIN"
  }
}
```

---

## Przykłady użycia

### JavaScript/TypeScript (fetch)

#### Admin - Lista pracowników

```typescript
const response = await fetch(
  "http://localhost:4321/api/workers?page=1&limit=20",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
if (data.success) {
  console.log("Workers:", data.data.workers);
  console.log("Total:", data.data.pagination.total_items);
}
```

#### Admin - Utworzenie pracownika

```typescript
const response = await fetch("http://localhost:4321/api/workers", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    first_name: "Jan",
    last_name: "Kowalski",
    pin: "1234",
    department: "Produkcja",
  }),
});

const data = await response.json();
if (data.success) {
  console.log("Worker created:", data.data);
}
```

#### Worker - Check-in

```typescript
const response = await fetch(
  "http://localhost:4321/api/time-registrations/toggle",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pin: "1234",
    }),
  }
);

const data = await response.json();
if (data.success) {
  console.log(`${data.message}:`, data.data.action);
  console.log("Worker:", data.data.worker);
}
```

#### Admin - Statystyki dashboard

```typescript
const response = await fetch(
  "http://localhost:4321/api/admin/dashboard/stats?date_from=2025-01-01",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
if (data.success) {
  console.log("Total registrations:", data.data.registrations.total);
  console.log("Active workers:", data.data.workers.active);
  console.log("Total hours:", data.data.work_hours.total_hours);
}
```

---

## Testowanie

### Thunder Client / Postman

1. Utwórz kolekcję dla każdej grupy endpointów
2. Ustaw zmienną środowiskową `adminToken` po zalogowaniu
3. Przetestuj wszystkie scenariusze:
   - Happy path (poprawne dane)
   - Błędy walidacji
   - Błędy autentykacji
   - Edge cases

### cURL

```bash
# Lista pracowników (Admin)
curl -X GET "http://localhost:4321/api/workers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check-in (Worker)
curl -X POST "http://localhost:4321/api/time-registrations/toggle" \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

# Statystyki dashboard (Admin)
curl -X GET "http://localhost:4321/api/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Deployment

### Checklist przed wdrożeniem

- [ ] Wszystkie endpointy przetestowane
- [ ] Zmienne środowiskowe skonfigurowane
- [ ] CORS skonfigurowany dla domeny produkcyjnej
- [ ] Rate limiting zaimplementowany
- [ ] Security headers dodane
- [ ] Error logging skonfigurowany
- [ ] Migracje bazy danych zastosowane
- [ ] RLS policies włączone i przetestowane
- [ ] Konta adminów utworzone w Supabase
- [ ] Dokumentacja API opublikowana

---

## Wsparcie i kontakt

W razie pytań lub problemów:

1. Sprawdź dokumentację
2. Przejrzyj kod komentarzy w service layer
3. Sprawdź logi błędów w konsoli

---

**Wersja**: 1.0.0  
**Data**: 2025-01-08  
**Status**: ✅ Production Ready
