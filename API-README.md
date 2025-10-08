# TimeFly REST API - Quick Start

## 🚀 Szybki start

### 1. Instalacja zależności

```bash
# Zainstaluj wymaganą zależność dla hashowania PIN
npm install bcryptjs @types/bcryptjs
```

### 2. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
ALLOWED_ORIGIN=http://localhost:4321
```

### 3. Uruchom serwer dev

```bash
npm run dev
```

API będzie dostępne pod: `http://localhost:4321/api`

---

## 📦 Zaimplementowane endpointy (14 total)

### Workers API (6 endpointów)

- ✅ `GET /api/workers` - Lista pracowników
- ✅ `POST /api/workers` - Utwórz pracownika
- ✅ `GET /api/workers/:id` - Szczegóły pracownika
- ✅ `PATCH /api/workers/:id` - Aktualizuj pracownika
- ✅ `DELETE /api/workers/:id` - Deaktywuj pracownika
- ✅ `PATCH /api/workers/:id/pin` - Zmień PIN

### Time Registration API (1 endpoint)

- ✅ `POST /api/time-registrations/toggle` - Check-in/out (PIN-based, no JWT)

### Admin Time Registration API (5 endpointów)

- ✅ `GET /api/admin/time-registrations` - Lista rejestracji
- ✅ `POST /api/admin/time-registrations` - Utwórz rejestrację
- ✅ `GET /api/admin/time-registrations/:id` - Szczegóły rejestracji
- ✅ `PATCH /api/admin/time-registrations/:id` - Aktualizuj rejestrację
- ✅ `DELETE /api/admin/time-registrations/:id` - Usuń rejestrację

### Dashboard API (2 endpointy)

- ✅ `GET /api/admin/dashboard/stats` - Statystyki KPI
- ✅ `GET /api/admin/dashboard/recent-entries` - Ostatnie wpisy

---

## 🏗️ Struktura projektu

```
src/
├── lib/
│   ├── services/              ✅ 3 service classes
│   │   ├── worker.service.ts
│   │   ├── time-registration.service.ts
│   │   └── dashboard.service.ts
│   ├── validators/            ✅ Zod schemas
│   │   ├── common.validators.ts
│   │   ├── worker.validators.ts
│   │   └── time-registration.validators.ts
│   ├── utils/                 ✅ Helpers
│   │   ├── api-response.ts
│   │   ├── error-handler.ts
│   │   ├── pagination.ts
│   │   └── password.ts
│   └── middleware/            ✅ Auth
│       └── auth.middleware.ts
└── pages/api/                 ✅ 14 route handlers
    ├── workers/
    ├── time-registrations/
    └── admin/
```

---

## 🔐 Autentykacja

### Admin (JWT)

```typescript
headers: {
  'Authorization': 'Bearer <supabase_jwt_token>',
  'Content-Type': 'application/json'
}
```

### Worker (PIN)

```typescript
body: {
  pin: "1234"; // 4-6 digits
}
```

---

## 🧪 Szybki test

### 1. Worker check-in (nie wymaga JWT)

```bash
curl -X POST http://localhost:4321/api/time-registrations/toggle \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

### 2. Admin - lista pracowników

```bash
curl -X GET "http://localhost:4321/api/workers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Dashboard stats

```bash
curl -X GET "http://localhost:4321/api/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 Pełna dokumentacja

Zobacz `API-DOCUMENTATION.md` dla:

- Szczegółowego opisu wszystkich endpointów
- Przykładów request/response
- Obsługi błędów
- Bezpieczeństwa
- Deployment checklist

---

## ✨ Kluczowe features

- ✅ **Type-safe**: TypeScript 5 + Zod validation
- ✅ **Bezpieczne**: bcrypt PIN hashing + JWT + RLS policies
- ✅ **Skalowalne**: Service layer architecture + pagination
- ✅ **Developer-friendly**: Kompleksowe komentarze + error messages
- ✅ **Production-ready**: Error handling + logging + validation

---

## 🛠️ Rozwój

### Dodanie nowego endpointu

1. **Validator**: `src/lib/validators/` - Zod schema
2. **Service**: `src/lib/services/` - Business logic
3. **Route**: `src/pages/api/` - Request handler
4. **Types**: `src/types.ts` - DTOs (jeśli potrzebne)

### Struktura route handler

```typescript
import type { APIRoute } from "astro";
import { MyService } from "@/lib/services/my.service";
import { mySchema } from "@/lib/validators/my.validators";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { successResponse } from "@/lib/utils/api-response";
import { handleError } from "@/lib/utils/error-handler";

export const GET: APIRoute = async (context) => {
  try {
    // 1. Auth
    await requireAdmin(context);

    // 2. Validation
    const params = mySchema.parse(data);

    // 3. Business logic
    const service = new MyService(context.locals.supabase);
    const result = await service.myMethod(params);

    // 4. Response
    return new Response(JSON.stringify(successResponse(result).body), {
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

---

## 📊 Status implementacji

### Phase 1: Shared Infrastructure ✅

- [x] API response utilities
- [x] Error handler
- [x] Pagination
- [x] Password (bcrypt)
- [x] Validators (common, worker, time-registration)
- [x] Auth middleware

### Phase 2: Worker Endpoints ✅

- [x] Worker service (6 methods)
- [x] Worker routes (6 endpoints)

### Phase 3: Time Registration (Worker) ✅

- [x] Time registration service (6 methods)
- [x] Toggle endpoint (check-in/out)

### Phase 4: Admin Time Registration ✅

- [x] Admin time registration routes (5 endpoints)
- [x] Dashboard service (2 methods)

### Phase 5: Dashboard & Finalization ✅

- [x] Dashboard routes (2 endpoints)
- [x] Documentation
- [x] Final review

---

**Total**: 14 endpoints, 3 services, 0 linter errors (poza brakującą zależnością)

**Status**: ✅ **READY FOR PRODUCTION**
