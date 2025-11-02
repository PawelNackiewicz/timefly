# Plan Testów - TimeFly

## 1. Wprowadzenie i cele testowania

### 1.1 Cel dokumentu

Niniejszy dokument określa kompleksową strategię testowania aplikacji TimeFly - systemu rejestracji czasu pracy opartego na mechanizmie wejścia/wyjścia z weryfikacją PIN.

### 1.2 Cele testowania

- **Zapewnienie poprawności funkcjonalnej** wszystkich kluczowych modułów systemu
- **Weryfikacja bezpieczeństwa** mechanizmów uwierzytelniania (PIN dla pracowników, Supabase Auth dla administratorów)
- **Walidacja integralności danych** w kontekście rejestracji czasu pracy i interwencji manualnych
- **Potwierdzenie wydajności** systemu przy równoczesnym użytkowaniu przez wielu pracowników
- **Sprawdzenie dostępności** interfejsu użytkownika, szczególnie na urządzeniach mobilnych
- **Weryfikacja odporności** na typowe zagrożenia bezpieczeństwa i błędy użytkownika

### 1.3 Kontekst projektu

TimeFly to aplikacja webowa MVP zbudowana w architekturze:

- **Frontend**: Astro 5 + React 19 + Tailwind 4 + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel

Kluczowe założenia:

- Dwupoziomowy system uwierzytelniania (PIN dla pracowników, email/hasło dla adminów)
- Mechanizm toggle dla check-in/check-out
- Możliwość manualnej interwencji administratora w rejestracje
- Soft delete dla pracowników (is_active flag)
- Row Level Security (RLS) jako podstawowy mechanizm kontroli dostępu

## 2. Zakres testów

### 2.1 W zakresie testów

#### Moduły funkcjonalne:

1. **Uwierzytelnianie i autoryzacja**

   - Logowanie administratorów (Supabase Auth)
   - Weryfikacja PIN pracowników
   - Polityki RLS
   - Middleware autoryzacji
   - Zarządzanie sesjami

2. **Zarządzanie pracownikami**

   - CRUD operacje na pracownikach
   - Zarządzanie PIN-ami (tworzenie, aktualizacja, weryfikacja unikalności)
   - Soft delete (deaktywacja)
   - Filtrowanie i wyszukiwanie
   - Paginacja wyników

3. **Rejestracja czasu pracy**

   - Mechanizm toggle check-in/check-out
   - Walidacja ograniczeń czasowych (check_out > check_in)
   - Wykrywanie aktywnych rejestracji
   - Obliczanie czasu pracy (duration_hours)
   - Statusy rejestracji (in_progress, completed)

4. **Interwencje manualne administratora**

   - Tworzenie rejestracji manualnych
   - Edycja istniejących rejestracji
   - Usuwanie rejestracji
   - Dodawanie notatek
   - Śledzenie modyfikacji (modified_by_admin_id)

5. **Dashboard i statystyki**

   - Obliczanie KPI (całkowite godziny, średnie, etc.)
   - Statystyki pracowników
   - Najnowsze wpisy
   - Filtrowanie według przedziałów czasowych
   - Wskaźniki wydajności

6. **Walidacja danych**
   - Walidacja Zod schemas
   - Ograniczenia bazy danych (constraints)
   - Walidacja formatów (UUID, ISO dates, PIN)
   - Walidacja długości pól

#### Aspekty niefunkcjonalne:

1. **Bezpieczeństwo**

   - Haszowanie PIN-ów (bcrypt)
   - Polityki RLS
   - Ochrona przed SQL injection
   - CORS policies
   - Rate limiting na endpointach PIN

2. **Wydajność**

   - Czasy odpowiedzi API
   - Optymalizacja zapytań (indeksy)
   - Caching (TanStack Query)
   - Wydajność przy równoczesnych check-in/check-out

3. **Dostępność**

   - Zgodność z WCAG 2.1 AA
   - Obsługa czytników ekranu
   - Kontrast kolorów
   - Komponenty Shadcn/ui (oparte na Radix UI)

4. **Responsywność**
   - Mobile-first design
   - Różne rozmiary ekranów
   - Touch gestures
   - Orientacja ekranu

### 2.2 Poza zakresem testów (w fazie MVP)

- Testy wydajnościowe obciążeniowe (stress testing)
- Testy bezpieczeństwa penetracyjne
- Integracje z systemami zewnętrznymi
- Testy lokalizacji (i18n)
- Funkcjonalności mobilne natywne
- Export danych (raporty)

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe (Unit Tests)

**Narzędzie**: Vitest

**Zakres**:

- **Utility functions**
  - `hashPin()` i `verifyPin()` - szyfrowanie PIN-ów
  - `parsePaginationParams()` - kalkulacja offsetu i limitów
  - Funkcje obliczeniowe (duration_hours, statistics)
  - Error handlers i AppError factory
- **Validators (Zod schemas)**

  - Walidacja PIN (4-6 cyfr)
  - Walidacja UUID
  - Walidacja dat ISO
  - Walidacja parametrów paginacji
  - Custom refinements (check_out > check_in)

- **Business logic helpers**
  - Kalkulacja statystyk dashboardu
  - Formatowanie dat i czasu
  - Parsowanie query parameters

**Kryteria sukcesu**:

- Pokrycie kodu > 80% dla modułów utility i validators
- Wszystkie edge cases pokryte testami
- Czas wykonania testów < 5 sekund

### 3.2 Testy integracyjne (Integration Tests)

**Narzędzie**: Vitest + Supabase Test Helpers

**Zakres**:

- **Services z bazą danych**
  - `WorkerService` - operacje CRUD, weryfikacja PIN, deaktywacja
  - `TimeRegistrationService` - toggle mechanism, CRUD, obliczenia
  - `DashboardService` - agregacje, statystyki, recent entries
- **API endpoints**
  - `/api/auth/*` - login, logout, me, reset-password
  - `/api/workers/*` - CRUD operations
  - `/api/time-registrations/*` - toggle endpoint
  - `/api/admin/*` - wszystkie admin endpoints
- **Middleware**

  - `requireAdmin()` - weryfikacja sesji i tokenów
  - Astro middleware - routing i error handling

- **Database constraints i triggers**
  - Foreign keys
  - Check constraints
  - Unique constraints
  - RLS policies

**Kryteria sukcesu**:

- Wszystkie główne ścieżki użytkownika przetestowane
- Weryfikacja interakcji między warstwami (API → Service → DB)
- Testy z rzeczywistą bazą danych testową
- Rollback po każdym teście

### 3.3 Testy end-to-end (E2E Tests)

**Narzędzie**: Playwright

**Zakres**:

#### Scenariusze krytyczne:

1. **Flow check-in/check-out pracownika**

   - Wejście na `/clock`
   - Wprowadzenie PIN
   - Check-in (weryfikacja komunikatu i stanu)
   - Check-out (weryfikacja czasu pracy)
   - Weryfikacja wpisu w historii

2. **Flow zarządzania pracownikami przez admina**

   - Login administratora
   - Dodanie nowego pracownika
   - Ustawienie PIN
   - Weryfikacja unikalności PIN
   - Edycja danych pracownika
   - Deaktywacja pracownika

3. **Flow interwencji manualnej**

   - Login administratora
   - Przeglądanie rejestracji
   - Edycja istniejącej rejestracji
   - Dodanie notatki
   - Weryfikacja flagi manual_intervention

4. **Flow dashboardu**
   - Login administratora
   - Weryfikacja KPI
   - Filtrowanie po datach
   - Przeglądanie najnowszych wpisów
   - Weryfikacja wykresów

#### Scenariusze błędów:

- Nieprawidłowy PIN
- Nieaktywny pracownik próbuje check-in
- Kolizja równoczesnych check-in/check-out
- Próba dostępu do admin panel bez uprawnień

**Kryteria sukcesu**:

- Wszystkie główne user journeys działają
- Testy stabilne (< 5% flakiness)
- Czas wykonania pełnego suite < 10 minut
- Testy tylko na Chrome

### 3.4 Testy wydajnościowe (Performance Tests)

**Narzędzie**: k6 / Artillery

**Zakres**:

- **API endpoints**
  - `/api/time-registrations/toggle` - 100 req/s
  - `/api/workers` - lista pracowników
  - `/api/admin/dashboard/stats` - agregacje
- **Database queries**

  - Czas wykonania zapytań < 200ms (p95)
  - Wykorzystanie indeksów
  - N+1 query problems

- **Frontend performance**
  - Lighthouse scores > 90
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s
  - Bundle size optimization

**Kryteria sukcesu**:

- API response time p95 < 500ms
- Obsługa 50 równoczesnych check-in/check-out bez błędów
- Frontend Lighthouse score > 90
- Brak memory leaks

### 3.5 Testy bezpieczeństwa (Security Tests)

**Zakres**:

1. **Authentication & Authorization**

   - Próba dostępu do admin endpoints bez tokenu
   - Próba obejścia RLS policies
   - Session hijacking attempts
   - CSRF protection (Astro)

2. **Input validation**

   - SQL injection attempts
   - XSS attempts w polach tekstowych
   - Path traversal w parametrach
   - Overflow w numeric fields

3. **PIN security**

   - Brute force protection (rate limiting)
   - PIN hashing verification (bcrypt)
   - Timing attacks prevention
   - PIN uniqueness enforcement

4. **Data exposure**
   - Weryfikacja, że pin_hash nie wraca w API
   - PII data protection
   - Error messages nie ujawniają szczegółów

**Kryteria sukcesu**:

- Brak podatności OWASP Top 10
- Wszystkie testy bezpieczeństwa przechodzą
- PIN-y są bezpiecznie haszowane
- RLS policies działają poprawnie

### 3.6 Testy dostępności (Accessibility Tests)

**Narzędzie**: axe-core / Pa11y

**Zakres**:

- **WCAG 2.1 AA compliance**

  - Keyboard navigation
  - Screen reader support
  - Color contrast ratios
  - Focus management
  - ARIA labels

- **Kluczowe komponenty**
  - Formularz PIN input
  - Tabele z rejestracjami
  - Dashboard KPI cards
  - Modal dialogs
  - Form validation messages

**Kryteria sukcesu**:

- 0 krytycznych błędów accessibility
- 100% keyboard navigable
- Screen reader friendly
- Kontrast > 4.5:1

### 3.7 Testy regresji (Regression Tests)

**Narzędzie**: Playwright + Visual Regression (Percy/Chromatic)

**Zakres**:

- Automatyczne uruchamianie po każdym PR
- Visual regression dla kluczowych ekranów
- API contract testing
- Database migration testing

**Kryteria sukcesu**:

- CI/CD pipeline z automatycznymi testami
- Blokada merge przy failed tests
- Visual diffs reviewed przed merge

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Moduł: Uwierzytelnianie pracownika (PIN)

#### Test Case TC-AUTH-001: Poprawne logowanie PIN

**Priorytet**: Krytyczny  
**Przedwarunki**: Pracownik z PIN "1234" istnieje i jest aktywny  
**Kroki**:

1. Przejdź do `/clock`
2. Wprowadź PIN "1234"
3. Kliknij "Submit"

**Oczekiwany rezultat**:

- Status 200
- Zwrócono dane pracownika
- Możliwość check-in

**Weryfikacja**:

```sql
SELECT * FROM workers WHERE pin_hash = [hash]
```

---

#### Test Case TC-AUTH-002: Nieprawidłowy PIN

**Priorytet**: Wysoki  
**Przedwarunki**: PIN "9999" nie istnieje  
**Kroki**:

1. Przejdź do `/clock`
2. Wprowadź PIN "9999"
3. Kliknij "Submit"

**Oczekiwany rezultat**:

- Status 401
- Error message: "Invalid PIN"
- Brak ujawnienia informacji o użytkownikach

---

#### Test Case TC-AUTH-003: Próba check-in nieaktywnym pracownikiem

**Priorytet**: Wysoki  
**Przedwarunki**: Pracownik z PIN "5555" istnieje ale is_active = false  
**Kroki**:

1. Wprowadź PIN "5555"
2. Próba check-in

**Oczekiwany rezultat**:

- Status 404
- Error message: "Worker not found or inactive"

---

#### Test Case TC-AUTH-004: Brute force protection na PIN

**Priorytet**: Wysoki  
**Przedwarunki**: Rate limiting skonfigurowany  
**Kroki**:

1. Wykonaj 10 prób z błędnym PIN w ciągu 1 minuty
2. Spróbuj kolejny raz

**Oczekiwany rezultat**:

- Status 429 (Too Many Requests) po 10 próbach
- Timeout 5 minut przed kolejną próbą

---

### 4.2 Moduł: Check-in/Check-out Toggle

#### Test Case TC-REG-001: Pierwszy check-in pracownika

**Priorytet**: Krytyczny  
**Przedwarunki**:

- Pracownik uwierzytelniony
- Brak aktywnej rejestracji

**Kroki**:

1. POST `/api/time-registrations/toggle` z PIN
2. Weryfikuj response

**Oczekiwany rezultat**:

```json
{
  "action": "check_in",
  "registration": {
    "id": "uuid",
    "worker_id": "uuid",
    "check_in": "2025-01-20T10:00:00Z",
    "check_out": null,
    "status": "in_progress",
    "manual_intervention": false
  },
  "worker": {
    "id": "uuid",
    "first_name": "Jan",
    "last_name": "Kowalski"
  }
}
```

**Weryfikacja DB**:

```sql
SELECT * FROM time_registrations
WHERE worker_id = [id] AND status = 'in_progress'
```

---

#### Test Case TC-REG-002: Check-out po check-in

**Priorytet**: Krytyczny  
**Przedwarunki**:

- Pracownik ma aktywną rejestrację (status = in_progress)
- Check-in był 4 godziny temu

**Kroki**:

1. POST `/api/time-registrations/toggle` z tym samym PIN
2. Weryfikuj response

**Oczekiwany rezultat**:

```json
{
  "action": "check_out",
  "registration": {
    "id": "uuid",
    "check_out": "2025-01-20T14:00:00Z",
    "status": "completed",
    "duration_hours": 4.0
  }
}
```

**Weryfikacja**:

- Status zmieniony na "completed"
- check_out > check_in
- duration_hours poprawnie wyliczone
- Brak aktywnych rejestracji dla tego pracownika

---

#### Test Case TC-REG-003: Podwójny check-in (race condition)

**Priorytet**: Wysoki  
**Przedwarunki**: Pracownik bez aktywnej rejestracji  
**Kroki**:

1. Wykonaj równocześnie 2 requesty POST toggle
2. Sprawdź rezultat

**Oczekiwany rezultat**:

- Tylko jedna rejestracja utworzona
- Drugi request zwraca conflict lub poprawnie obsługuje check-out
- Integralność danych zachowana

---

#### Test Case TC-REG-004: Kalkulacja duration_hours

**Priorytet**: Średni  
**Przedwarunki**: Rejestracja completed  
**Dane testowe**:

- check_in: "2025-01-20T08:00:00Z"
- check_out: "2025-01-20T16:30:00Z"

**Oczekiwany rezultat**:

- duration_hours = 8.5
- Zaokrąglenie do 2 miejsc po przecinku

---

### 4.3 Moduł: Zarządzanie pracownikami

#### Test Case TC-WORKER-001: Tworzenie pracownika z unikalnym PIN

**Priorytet**: Krytyczny  
**Przedwarunki**: Admin zalogowany  
**Kroki**:

1. POST `/api/workers`

```json
{
  "first_name": "Anna",
  "last_name": "Nowak",
  "pin": "1111",
  "department": "IT",
  "is_active": true
}
```

**Oczekiwany rezultat**:

- Status 201
- Pracownik utworzony
- PIN zahashowany (bcrypt)
- pin_hash nie wraca w response

**Weryfikacja**:

```sql
SELECT pin_hash FROM workers WHERE id = [new_id]
-- Sprawdź czy hash zaczyna się od $2b$ (bcrypt)
```

---

#### Test Case TC-WORKER-002: Próba utworzenia pracownika z istniejącym PIN

**Priorytet**: Wysoki  
**Przedwarunki**: Pracownik z PIN "2222" już istnieje  
**Kroki**:

1. POST `/api/workers` z PIN "2222"

**Oczekiwany rezultat**:

- Status 409 (Conflict)
- Error: "PIN already exists"
- Pracownik nie został utworzony

---

#### Test Case TC-WORKER-003: Aktualizacja PIN pracownika

**Priorytet**: Wysoki  
**Przedwarunki**: Pracownik istnieje  
**Kroki**:

1. PATCH `/api/workers/[id]/pin`

```json
{
  "new_pin": "3333"
}
```

**Oczekiwany rezultat**:

- Status 200
- PIN zaktualizowany
- Nowy hash w bazie
- Stary PIN nie działa
- Nowy PIN działa

---

#### Test Case TC-WORKER-004: Filtrowanie i wyszukiwanie pracowników

**Priorytet**: Średni  
**Przedwarunki**: 50 pracowników w bazie  
**Kroki**:

1. GET `/api/workers?search=kowal&department=IT&is_active=true&page=1&limit=20`

**Oczekiwany rezultat**:

```json
{
  "workers": [...], // Tylko pracownicy pasujący do filtrów
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 5
  }
}
```

**Weryfikacja**:

- Filtr ILIKE działa (case insensitive)
- Paginacja poprawna
- Sorting według last_name

---

#### Test Case TC-WORKER-005: Soft delete (deaktywacja)

**Priorytet**: Wysoki  
**Przedwarunki**: Aktywny pracownik z rejestracjami  
**Kroki**:

1. DELETE `/api/workers/[id]` (faktycznie PATCH is_active)
2. Próba check-in z jego PIN

**Oczekiwany rezultat**:

- Status 200 na delete
- is_active = false
- Worker nie został usunięty z bazy
- Rejestracje historyczne zachowane
- Check-in zwraca 404

---

### 4.4 Moduł: Interwencje manualne administratora

#### Test Case TC-ADMIN-001: Tworzenie rejestracji manualnej

**Priorytet**: Wysoki  
**Przedwarunki**: Admin zalogowany, pracownik istnieje  
**Kroki**:

1. POST `/api/admin/time-registrations`

```json
{
  "worker_id": "uuid",
  "check_in": "2025-01-20T08:00:00Z",
  "notes": "Zapomniał check-in"
}
```

**Oczekiwany rezultat**:

- Status 201
- Rejestracja utworzona
- manual_intervention = true
- modified_by_admin_id = [admin_id]
- status = "in_progress"

---

#### Test Case TC-ADMIN-002: Edycja rejestracji z constraint validation

**Priorytet**: Wysoki  
**Przedwarunki**: Rejestracja completed istnieje  
**Kroki**:

1. PATCH `/api/admin/time-registrations/[id]`

```json
{
  "check_in": "2025-01-20T10:00:00Z",
  "check_out": "2025-01-20T09:00:00Z" // check_out przed check_in!
}
```

**Oczekiwany rezultat**:

- Status 400
- Error: "Check-out time must be after check-in time"
- Rejestracja nie zmieniona

---

#### Test Case TC-ADMIN-003: Usunięcie rejestracji

**Priorytet**: Średni  
**Przedwarunki**: Rejestracja istnieje  
**Kroki**:

1. DELETE `/api/admin/time-registrations/[id]`

**Oczekiwany rezultat**:

- Status 204
- Rejestracja usunięta (hard delete)
- Cascade: nie wpływa na pracownika

---

#### Test Case TC-ADMIN-004: Weryfikacja flag manual_intervention

**Priorytet**: Średni  
**Przedwarunki**: Mix rejestracji (automatyczne i manualne)  
**Kroki**:

1. GET `/api/admin/time-registrations?manual_intervention=true`

**Oczekiwany rezultat**:

- Tylko rejestracje z manual_intervention = true
- Dla każdej: modified_by_admin_id populated
- Możliwość sortowania i filtrowania

---

### 4.5 Moduł: Dashboard i statystyki

#### Test Case TC-DASH-001: Kalkulacja statystyk za okres

**Priorytet**: Wysoki  
**Przedwarunki**: Dane testowe za ostatnie 30 dni  
**Kroki**:

1. GET `/api/admin/dashboard/stats?date_from=2025-01-01&date_to=2025-01-31`

**Oczekiwany rezultat**:

```json
{
  "time_period": {
    "from": "2025-01-01T00:00:00Z",
    "to": "2025-01-31T23:59:59Z"
  },
  "registrations": {
    "total": 150,
    "completed": 145,
    "in_progress": 5,
    "manual_interventions": 10,
    "manual_intervention_rate": 6.67
  },
  "workers": {
    "total": 30,
    "active": 28,
    "inactive": 2,
    "with_active_registration": 5
  },
  "work_hours": {
    "total_hours": 1200.0,
    "average_per_registration": 8.28,
    "average_per_worker": 42.86
  }
}
```

**Weryfikacja**:

- Aggregacje poprawnie wyliczone
- Procentowe wskaźniki zaokrąglone
- Performance < 500ms

---

#### Test Case TC-DASH-002: Recent entries z limitem

**Priorytet**: Średni  
**Kroki**:

1. GET `/api/admin/dashboard/recent-entries?limit=10`

**Oczekiwany rezultat**:

- Maksymalnie 10 wpisów
- Sortowanie według created_at DESC
- Każdy wpis zawiera worker details
- duration_hours wyliczone dla completed

---

#### Test Case TC-DASH-003: Wydajność agregacji na dużym zbiorze

**Priorytet**: Średni  
**Przedwarunki**: 10,000 rejestracji w bazie  
**Kroki**:

1. GET `/api/admin/dashboard/stats` bez parametrów (last 30 days)

**Oczekiwany rezultat**:

- Response time < 1000ms (p95)
- Wykorzystanie indeksów (idx_time_registrations_check_in)
- Poprawne obliczenia mimo dużej ilości danych

---

## 5. Środowisko testowe

### 5.1 Konfiguracja środowisk

#### Development Environment

- **URL**: http://localhost:4321
- **Database**: Supabase local instance (Docker)
- **Features**: Hot reload, debug logs, dev tools
- **Usage**: Daily development testing

#### Test Environment

- **URL**: https://test.timefly.vercel.app
- **Database**: Supabase test project (isolated)
- **Features**: Mirror produkcji, CI/CD integration
- **Usage**: Automated tests, integration tests
- **Data**: Seed data + test fixtures

#### Staging Environment

- **URL**: https://staging.timefly.vercel.app
- **Database**: Supabase staging project
- **Features**: Production-like, pre-release testing
- **Usage**: UAT, performance tests, demo
- **Data**: Anonymized production data

#### Production Environment

- **URL**: https://timefly.com
- **Database**: Supabase production project
- **Features**: Real users, monitoring, backups
- **Usage**: Smoke tests only

### 5.2 Baza danych testowa

**Setup**:

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Seed test data
pnpm run db:seed:test
```

**Test data sets**:

1. **Minimal set**: 5 workers, 20 registrations
2. **Standard set**: 30 workers, 500 registrations (last 60 days)
3. **Large set**: 100 workers, 10,000 registrations (performance tests)

**Isolation strategy**:

- Każdy test suite ma własną transakcję
- Rollback po każdym teście
- Parallel test execution w izolowanych schema

### 5.3 Test accounts

#### Administrator accounts:

```
Email: admin@test.timefly.pl
Password: Test123!@#
Role: Super Admin
```

```
Email: manager@test.timefly.pl
Password: Test123!@#
Role: Manager (ograniczone uprawnienia)
```

#### Worker PIN codes:

```
PIN: 1111 - Jan Kowalski (IT, active)
PIN: 2222 - Anna Nowak (HR, active)
PIN: 3333 - Piotr Wiśniewski (IT, active)
PIN: 4444 - Maria Kowalczyk (Sales, inactive)
```

### 5.4 Test data management

**Seeding**:

```typescript
// tests/fixtures/seed.ts
export async function seedDatabase() {
  await createAdmins(2);
  await createWorkers(30);
  await createTimeRegistrations(500);
}
```

**Cleanup**:

```typescript
afterEach(async () => {
  await supabase
    .from("time_registrations")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("workers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
});
```

**Fixtures**:

- `tests/fixtures/workers.json`
- `tests/fixtures/registrations.json`
- `tests/fixtures/admins.json`

## 6. Narzędzia do testowania

### 6.1 Framework testowy

#### Unit & Integration Tests

**Vitest**

- Konfiguracja: `vitest.config.ts`
- Coverage tool: v8
- UI mode: Vitest UI
- Parallel execution

```bash
pnpm test              # Run all tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests
pnpm test:coverage     # With coverage report
pnpm test:ui           # Vitest UI
```

#### E2E Tests

**Playwright**

```bash
pnpm test:e2e          # Headless
pnpm test:e2e:headed   # Headed mode
pnpm test:e2e:debug    # Debug mode
pnpm test:e2e:report   # HTML report
```

**Configuration**:

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

### 6.2 Test utilities i helpers

#### Supabase Test Client

```typescript
// tests/helpers/supabase.ts
export function createTestClient() {
  return createClient<Database>(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_ANON_KEY!
  );
}
```

#### Authentication helpers

```typescript
// tests/helpers/auth.ts
export async function loginAsAdmin(email: string) {
  const { data } = await supabase.auth.signInWithPassword({
    email,
    password: "Test123!@#",
  });
  return data.session?.access_token;
}

export async function authenticateWorker(pin: string) {
  const response = await fetch("/api/time-registrations/toggle", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
  return response.json();
}
```

#### Test data builders

```typescript
// tests/builders/worker.builder.ts
export class WorkerBuilder {
  private data: Partial<CreateWorkerCommand> = {};

  withName(firstName: string, lastName: string) {
    this.data.first_name = firstName;
    this.data.last_name = lastName;
    return this;
  }

  withPin(pin: string) {
    this.data.pin = pin;
    return this;
  }

  build() {
    return {
      first_name: this.data.first_name || "Test",
      last_name: this.data.last_name || "Worker",
      pin: this.data.pin || "9999",
      department: this.data.department,
      is_active: this.data.is_active ?? true,
    };
  }
}
```

### 6.3 Performance testing

**k6**

```javascript
// tests/performance/check-in-load.js
import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Ramp up
    { duration: "5m", target: 50 }, // Steady
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% < 500ms
    http_req_failed: ["rate<0.01"], // <1% errors
  },
};

export default function () {
  const payload = JSON.stringify({ pin: "1111" });
  const res = http.post(
    "http://localhost:4321/api/time-registrations/toggle",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
```

### 6.4 Accessibility testing

**axe-core + Playwright**

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("clock page should not have accessibility violations", async ({
  page,
}) => {
  await page.goto("/clock");

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 6.5 Visual regression testing

**Playwright Screenshots**

```typescript
test("dashboard visual regression", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveScreenshot("dashboard.png", {
    fullPage: true,
    animations: "disabled",
  });
});
```

**Alternatywa: Chromatic** (optional)

- Integracja z Storybook
- Automatic visual diffing
- Cloud-based

### 6.6 CI/CD Integration

**GitHub Actions**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4321/
            http://localhost:4321/clock
            http://localhost:4321/dashboard
          uploadArtifacts: true
```

## 7. Harmonogram testów

### 7.1 Faza 1: Setup i Unit Tests (Tydzień 1)

**Dni 1-2: Setup środowiska testowego**

- [ ] Konfiguracja Vitest
- [ ] Setup Supabase test database
- [ ] Przygotowanie test fixtures
- [ ] CI/CD pipeline basics

**Dni 3-5: Unit Tests**

- [ ] Testy utility functions (password, pagination)
- [ ] Testy validators (wszystkie Zod schemas)
- [ ] Testy error handlers
- [ ] Coverage > 80%

### 7.2 Faza 2: Integration Tests (Tydzień 2)

**Dni 1-3: Service Layer Tests**

- [ ] WorkerService - wszystkie metody
- [ ] TimeRegistrationService - toggle, CRUD
- [ ] DashboardService - statistics, aggregations
- [ ] Database constraints i RLS policies

**Dni 4-5: API Endpoint Tests**

- [ ] Auth endpoints (/api/auth/\*)
- [ ] Worker endpoints (/api/workers/\*)
- [ ] Time registration endpoints
- [ ] Admin endpoints (/api/admin/\*)

### 7.3 Faza 3: E2E Tests (Tydzień 3)

**Dni 1-2: Setup Playwright**

- [ ] Konfiguracja Playwright
- [ ] Page Object Models
- [ ] Test helpers i fixtures
- [ ] Multi-browser setup

**Dni 3-5: Critical User Flows**

- [ ] Worker check-in/check-out flow
- [ ] Admin employee management flow
- [ ] Manual intervention flow
- [ ] Dashboard and reporting flow

### 7.4 Faza 4: Non-Functional Tests (Tydzień 4)

**Dni 1-2: Performance Tests**

- [ ] API load tests (k6)
- [ ] Database query optimization
- [ ] Frontend performance (Lighthouse)
- [ ] Caching verification

**Dni 3-4: Security & Accessibility**

- [ ] Security tests (OWASP checks)
- [ ] PIN brute force protection
- [ ] Accessibility audit (axe-core)
- [ ] WCAG 2.1 AA compliance

**Dzień 5: Visual Regression**

- [ ] Screenshot tests setup
- [ ] Critical pages coverage
- [ ] Mobile responsiveness

### 7.5 Ongoing: Regression & Maintenance

**Daily** (w CI/CD):

- Unit tests na każdym commit
- Linting i type checking

**Per PR**:

- Unit + Integration tests
- E2E smoke tests
- Accessibility checks
- Code coverage report

**Weekly**:

- Pełny E2E test suite
- Performance benchmarks
- Security scans

**Monthly**:

- Dependency updates + test
- Load testing
- Accessibility audit
- Test coverage review

## 8. Kryteria akceptacji testów

### 8.1 Kryteria funkcjonalne

#### Testy jednostkowe

- [x] **Coverage**: Minimum 80% code coverage dla utils, validators, helpers
- [x] **Pass rate**: 100% testów przechodzi
- [x] **Performance**: Cały suite wykonuje się < 10 sekund
- [x] **Edge cases**: Wszystkie znane edge cases pokryte

#### Testy integracyjne

- [x] **Coverage**: Wszystkie services i API endpoints
- [x] **Pass rate**: 100% testów przechodzi
- [x] **Database**: Testy z rzeczywistą bazą testową
- [x] **RLS**: Polityki RLS zweryfikowane
- [x] **Constraints**: Wszystkie database constraints przetestowane

#### Testy E2E

- [x] **Critical paths**: 100% głównych user journeys
- [x] **Cross-browser**: Testy na Chrome
- [x] **Mobile**: Testy na urządzeniach mobilnych (viewport)
- [x] **Stability**: < 5% flakiness rate
- [x] **Pass rate**: 95% testów przechodzi (5% buffer na flaky)

### 8.2 Kryteria niefunkcjonalne

#### Wydajność

- [x] **API Response Time**: p95 < 500ms dla wszystkich endpoints
- [x] **Database Queries**: p95 < 200ms
- [x] **Concurrent Users**: Obsługa 50 równoczesnych check-in/check-out
- [x] **Frontend Load Time**:
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s
  - Lighthouse Score > 90

#### Bezpieczeństwo

- [x] **PIN Security**:
  - Bcrypt hashing z cost factor >= 10
  - Rate limiting: max 10 prób/5 minut
  - PIN nie wraca w żadnym API response
- [x] **Authentication**:
  - Tokeny JWT poprawnie weryfikowane
  - Session timeout: 24h
  - RLS policies zapobiegają unauthorized access
- [x] **Input Validation**:
  - Wszystkie inputs walidowane (Zod)
  - SQL injection protection (parameterized queries)
  - XSS protection (Astro auto-escape)
- [x] **OWASP Top 10**: Brak znanych vulnerabilities

#### Dostępność

- [x] **WCAG 2.1 AA**: 100% compliance
- [x] **Keyboard Navigation**: Wszystkie funkcje dostępne z klawiatury
- [x] **Screen Readers**: Poprawne ARIA labels i semantyczny HTML
- [x] **Color Contrast**: Minimum 4.5:1 dla tekstu
- [x] **Focus Management**: Widoczny focus indicator

#### Responsywność

- [x] **Viewports**: Testy na 320px, 768px, 1024px, 1920px
- [x] **Orientacja**: Portrait i landscape
- [x] **Touch**: Touch targets >= 44x44px
- [x] **Mobile-first**: UI optymalizowany dla mobile

### 8.3 Kryteria dokumentacji

- [x] **Test Cases**: Wszystkie test cases udokumentowane
- [x] **Test Data**: Fixtures i seed data opisane
- [x] **Setup Guide**: Instrukcje uruchomienia testów
- [x] **Coverage Reports**: Generowane i dostępne w CI/CD
- [x] **Bug Reports**: Template i proces raportowania

### 8.4 Definicja "Done" dla testowania

Feature uważany za przetestowany gdy:

1. ✅ Wszystkie unit tests napisane i przechodzą
2. ✅ Testy integracyjne pokrywają service layer
3. ✅ E2E test dla głównego user flow istnieje
4. ✅ Security checklist zweryfikowany
5. ✅ Accessibility audit przeprowadzony (axe-core)
6. ✅ Performance benchmarks spełniają kryteria
7. ✅ Code review z perspektywy testability
8. ✅ Dokumentacja zaktualizowana
9. ✅ CI/CD pipeline przechodzi
10. ✅ QA sign-off otrzymany

### 8.5 Exit criteria dla faz testowania

#### Faza Unit Testing

- [ ] 80%+ code coverage
- [ ] 0 krytycznych błędów
- [ ] Wszystkie edge cases pokryte

#### Faza Integration Testing

- [ ] Wszystkie API endpoints przetestowane
- [ ] RLS policies zweryfikowane
- [ ] Database migrations przetestowane
- [ ] 0 krytycznych błędów

#### Faza E2E Testing

- [ ] Wszystkie główne user flows działają
- [ ] Cross-browser testing ukończony
- [ ] Mobile testing ukończony
- [ ] < 5% flaky tests

#### Faza Performance Testing

- [ ] API benchmarks spełniają kryteria
- [ ] Lighthouse scores > 90
- [ ] Load tests przeszły
- [ ] Brak memory leaks

#### Faza Security Testing

- [ ] OWASP checklist: 0 critical findings
- [ ] PIN security zweryfikowany
- [ ] Rate limiting działa
- [ ] RLS policies skuteczne

#### Ready for Production

- [ ] Wszystkie fazy zakończone
- [ ] 0 critical bugs, < 5 high priority bugs
- [ ] Monitoring i alerting skonfigurowane
- [ ] Rollback plan przygotowany
- [ ] Stakeholder approval

## 9. Role i odpowiedzialności w procesie testowania

### 9.1 Test Owner / QA Lead

**Osoba**: [Do przypisania]

**Odpowiedzialności**:

- Zarządzanie całym procesem testowania
- Priorytetyzacja test cases
- Review planów testów
- Koordynacja między zespołami
- Raportowanie statusu testów do stakeholders
- Decyzje go/no-go dla releases
- Utrzymanie test documentation
- Continuous improvement procesu testów

**Metryki**:

- Test coverage %
- Pass/fail rates
- Defect density
- Test execution time

### 9.2 Developers

**Odpowiedzialności**:

- Pisanie unit tests dla własnego kodu
- Utrzymanie testów przy refactoringu
- Fixing błędów znalezionych w testach
- Code review z perspektywy testability
- Pomoc w debugging flaky tests
- Tworzenie test fixtures i helpers
- Implementacja test utilities

**Best practices**:

- Test-Driven Development (TDD) dla critical code
- Minimum 80% coverage dla nowego kodu
- Testy przechodzą przed merge do main
- Self-review przed PR: czy kod jest testowalny?

### 9.3 QA Engineers (jeśli dedykowani)

**Odpowiedzialności**:

- Pisanie i utrzymanie E2E tests
- Manual exploratory testing
- Test case design
- Bug reporting i verification
- Test automation
- Performance testing
- Security testing
- Accessibility testing
- UAT coordination

**Tools expertise**:

- Playwright
- k6
- axe-core
- Browser DevTools

### 9.4 DevOps Engineer

**Odpowiedzialności**:

- Setup CI/CD pipeline dla testów
- Utrzymanie test environments
- Database seeding automation
- Test data management
- Performance monitoring setup
- Log aggregation dla testów
- Flaky test detection i reporting
- Test result dashboards

**Infrastructure**:

- GitHub Actions workflows
- Supabase test projects
- Vercel preview deployments
- Test coverage reporting (Codecov)

### 9.5 Product Owner / Stakeholder

**Odpowiedzialności**:

- Definiowanie acceptance criteria
- Priorytetyzacja test scenarios
- UAT participation
- Sign-off na releases
- Feedback na test coverage
- Decision making na risk vs. schedule trade-offs

**Zaangażowanie**:

- Weekly test status reviews
- Pre-release UAT sessions
- Post-release metrics review

### 9.6 Security Specialist (konsultant)

**Odpowiedzialności**:

- Security test plan review
- Penetration testing (post-MVP)
- Security best practices guidance
- Vulnerability assessment
- Audit RLS policies
- Rate limiting verification

**Zaangażowanie**:

- Quarterly security audits
- Pre-release security checklist

## 10. Procedury raportowania błędów

### 10.1 Klasyfikacja błędów (Bug Severity)

#### Critical (P0)

**Definicja**: System nie działa, brak workaround, blokuje produkcję
**Przykłady**:

- Baza danych nie odpowiada
- Nie można się zalogować (admini i pracownicy)
- Check-in/check-out całkowicie nie działa
- Data loss
- Security breach

**SLA**: Fix w ciągu 4 godzin, hotfix deployment

#### High (P1)

**Definicja**: Główna funkcjonalność nie działa, workaround istnieje
**Przykłady**:

- Check-in działa ale duration_hours niepoprawne
- Dashboard statistics błędnie wyliczone
- PIN reset nie działa
- RLS policy pozwala na unauthorized access w edge case

**SLA**: Fix w ciągu 24 godzin, patch w najbliższym release

#### Medium (P2)

**Definicja**: Mniejsza funkcjonalność nie działa, nie blokuje core flows
**Przykłady**:

- Filtrowanie pracowników nie działa dla pewnych kombinacji
- Sortowanie tabeli nieprawidłowe
- UI visual glitch
- Performance degradation < 2x

**SLA**: Fix w ciągu 1 tygodnia, następny planned release

#### Low (P3)

**Definicja**: Drobne problemy, kosmetyczne, nice-to-have
**Przykłady**:

- Typo w UI
- Tooltip positioning
- Accessibility minor issues
- Minor UX improvements

**SLA**: Fix w backlog, priorytetyzowane z features

### 10.2 Bug Report Template

**Title**: [Moduł] Krótki opis problemu

**Environment**:

- [ ] Local Development
- [ ] Test Environment
- [ ] Staging
- [ ] Production

**Severity**: [Critical / High / Medium / Low]

**Description**:
Jasny opis co jest nie tak i jaki jest expected behavior.

**Steps to Reproduce**:

1. Krok 1
2. Krok 2
3. Krok 3

**Expected Result**:
Co powinno się stać

**Actual Result**:
Co się faktycznie dzieje

**Screenshots/Videos**:
[Załącz jeśli applicable]

**Additional Context**:

- Browser/Device: Chrome 120 / iPhone 13
- User role: Admin / Worker
- Test account: admin@test.timefly.pl / PIN 1111
- Timestamp: 2025-01-20 14:30:00 UTC
- Frequency: Always / Intermittent (50%) / Rare (<10%)

**Logs/Error Messages**:

```
[Paste relevant logs here]
```

**Workaround**:
[Jeśli istnieje]

**Related Issues**:
#123, #456

### 10.3 Bug Lifecycle

```
┌─────────┐
│  NEW    │ → Bug zgłoszony
└────┬────┘
     │
     ↓
┌─────────┐
│TRIAGED  │ → Severity przypisany, assigned to dev
└────┬────┘
     │
     ↓
┌─────────┐
│IN PROG  │ → Developer pracuje nad fix
└────┬────┘
     │
     ↓
┌─────────┐
│RESOLVED │ → Fix gotowy, deployed to test
└────┬────┘
     │
     ↓
┌─────────┐
│VERIFIED │ → QA zweryfikował fix
└────┬────┘
     │
     ↓
┌─────────┐
│ CLOSED  │ → Deployed to production
└─────────┘
```

**States**:

- **New**: Świeżo zgłoszony bug
- **Triaged**: Zweryfikowany i przypisany
- **In Progress**: W trakcie pracy
- **Resolved**: Fix gotowy, czeka na weryfikację
- **Verified**: QA potwierdził fix
- **Closed**: Deployed na prod i zamknięty
- **Rejected**: Not a bug / Won't fix / Duplicate
- **Reopened**: Bug wrócił po fix

### 10.4 Bug Tracking Tool

**Rekomendacja**: GitHub Issues + GitHub Projects

**Labele**:

- `bug` - Standard bug
- `critical` - P0 severity
- `high-priority` - P1 severity
- `medium-priority` - P2 severity
- `low-priority` - P3 severity
- `security` - Security-related
- `performance` - Performance issue
- `accessibility` - A11y issue
- `needs-investigation` - Requires more info
- `flaky-test` - Test instability
- `regression` - Previously working
- `wont-fix` - Closing without fix
- `duplicate` - Duplicate of another issue

**Board columns**:

1. New Issues (triage needed)
2. Triaged (ready to work)
3. In Progress
4. In Review (PR open)
5. Ready to Test (deployed to test env)
6. Done (verified and closed)

### 10.5 Bug Triage Process

**Częstotliwość**: Daily (codziennie rano)

**Uczestnicy**:

- QA Lead
- Tech Lead
- Product Owner (dla high priority)

**Proces**:

1. **Review new bugs** zgłoszonych w ostatnich 24h
2. **Verify reproducibility** - czy da się odtworzyć?
3. **Assign severity** (P0-P3)
4. **Assign owner** - kto będzie fixował?
5. **Estimate effort** - ile czasu zajmie fix?
6. **Prioritize** - kiedy fix powinien być gotowy?
7. **Update status** - przenieś do odpowiedniego kolumny

**Critical bug process** (P0):

- Immediate notification (Slack alert)
- Emergency triage (w ciągu 30 min)
- All-hands-on-deck jeśli production
- Hourly status updates

### 10.6 Bug Metrics & KPIs

**Monitorowane metryki**:

1. **Bug Discovery Rate**

   - Ile bugów znalezionych per sprint/release
   - Trend: maleje po stabilizacji

2. **Escape Rate**

   - Ile bugów dotarło do produkcji
   - Target: < 5% of total bugs found

3. **Mean Time to Resolve (MTTR)**

   - P0: < 4 hours
   - P1: < 24 hours
   - P2: < 1 week
   - P3: < 1 month

4. **Reopen Rate**

   - Ile bugów wraca po fix
   - Target: < 10%

5. **Test Effectiveness**
   - % bugów złapanych przez testy automatyczne
   - Target: > 70%

**Dashboard**: GitHub Insights + custom scripts

### 10.7 Communication Channels

**Bug alerts**:

- **P0 (Critical)**: Slack @channel, email to tech lead
- **P1 (High)**: Slack mention, GitHub notification
- **P2/P3**: GitHub notification only

**Bug status updates**:

- Daily standup: Active P0/P1 bugs
- Weekly: Bug metrics review
- Pre-release: Bug burndown chart

**Bug postmortems** (dla P0):

- What happened?
- Root cause analysis
- Why wasn't it caught in testing?
- Prevention actions
- Document learnings

---

## 11. Podsumowanie i następne kroki

### 11.1 Podsumowanie strategii

Plan testów TimeFly obejmuje:

✅ **Comprehensive coverage** - Od unit testów po E2E, z uwzględnieniem wszystkich kluczowych modułów

✅ **Security-first approach** - Szczególny nacisk na bezpieczeństwo PIN authentication, RLS policies i input validation

✅ **Performance-aware** - Benchmarki i optymalizacje dla responsywności systemu

✅ **Accessibility compliance** - WCAG 2.1 AA jako standard

✅ **Automation-driven** - CI/CD integration dla szybkiego feedback loop

✅ **Mobile-optimized** - Testy na różnych viewport i devices

✅ **Clear ownership** - Zdefiniowane role i odpowiedzialności

✅ **Structured bug management** - Proces od zgłoszenia do zamknięcia

### 11.2 Kluczowe priorytety

**Faza MVP** (najbliższe 4 tygodnie):

1. **Unit tests** dla validators i utilities (coverage > 80%)
2. **Integration tests** dla services i API endpoints
3. **E2E smoke tests** dla głównych flows (check-in/check-out, admin panel)
4. **Security testing** - PIN security, RLS policies
5. **Basic accessibility** - keyboard navigation, screen readers

**Post-MVP** (następne 2-3 miesiące):

1. **Full E2E suite** - wszystkie user scenarios
2. **Performance testing** - load tests, optimization
3. **Advanced accessibility** - pełny WCAG 2.1 AA audit
4. **Visual regression** - screenshot tests
5. **Penetration testing** - security audit przez specjalistę

### 11.3 Success metrics (3 miesiące po wdrożeniu)

**Quality metrics**:

- [ ] 0 critical bugs w production
- [ ] < 5 high-priority bugs discovered per month
- [ ] Test coverage > 80%
- [ ] E2E test pass rate > 95%

**Performance metrics**:

- [ ] API p95 response time < 500ms
- [ ] Frontend Lighthouse score > 90
- [ ] Zero downtime deployments

**User satisfaction**:

- [ ] Check-in/check-out success rate > 99%
- [ ] Admin satisfaction survey > 4/5
- [ ] Bug reports from users < 10 per month

### 11.4 Następne kroki

**Natychmiastowe akcje** (tydzień 1):

1. [ ] Review i approval tego planu testów
2. [ ] Setup Vitest w projekcie
3. [ ] Konfiguracja Supabase test database
4. [ ] Utworzenie test fixtures i seed data
5. [ ] Setup GitHub Actions dla CI/CD
6. [ ] Rozpoczęcie pisania pierwszych unit tests

**Krótkoterminowe** (miesiąc 1):

1. [ ] Implementacja wszystkich unit tests
2. [ ] Integration tests dla services
3. [ ] Setup Playwright
4. [ ] Pierwsze E2E smoke tests
5. [ ] Security audit checklist

**Średnioterminowe** (miesiące 2-3):

1. [ ] Pełny E2E suite
2. [ ] Performance testing i optymalizacja
3. [ ] Accessibility audit i fixes
4. [ ] Visual regression tests
5. [ ] Load testing

### 11.5 Continuous Improvement

**Test retrospectives** (co sprint):

- Co działało dobrze?
- Które testy były najbardziej wartościowe?
- Jakie bugs uciekły i dlaczego?
- Jak możemy poprawić proces?

**Test maintenance**:

- Regularny review flaky tests
- Aktualizacja test data
- Refactoring test code
- Documentation updates

**Learning & sharing**:

- Wewnętrzne tech talks o testing best practices
- Sharing test patterns w zespole
- Contributing to test utilities
- Dokumentowanie lessons learned

---

## Załączniki

### A. Test Data Examples

#### Przykładowy Worker

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "Jan",
  "last_name": "Kowalski",
  "pin": "1111", // plain (tylko do tworzenia)
  "pin_hash": "$2b$10$...", // w bazie
  "department": "IT",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Przykładowa Time Registration

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "worker_id": "550e8400-e29b-41d4-a716-446655440000",
  "check_in": "2025-01-20T08:00:00Z",
  "check_out": "2025-01-20T16:30:00Z",
  "status": "completed",
  "manual_intervention": false,
  "modified_by_admin_id": null,
  "notes": null,
  "duration_hours": 8.5
}
```

### B. Kluczowe endpointy do testowania

**Public endpoints**:

- `POST /api/time-registrations/toggle` - Worker check-in/check-out
- `POST /api/auth/login` - Admin login
- `POST /api/auth/reset-password` - Password reset

**Protected admin endpoints**:

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/recent-entries` - Recent entries
- `GET /api/workers` - List workers
- `POST /api/workers` - Create worker
- `PATCH /api/workers/:id` - Update worker
- `PATCH /api/workers/:id/pin` - Update PIN
- `DELETE /api/workers/:id` - Deactivate worker
- `GET /api/admin/time-registrations` - List registrations
- `POST /api/admin/time-registrations` - Manual registration
- `PATCH /api/admin/time-registrations/:id` - Edit registration
- `DELETE /api/admin/time-registrations/:id` - Delete registration

### C. Database Schema Reference

**Tables**:

- `auth.users` - Supabase auth (admini)
- `public.admins` - Admin profiles
- `public.workers` - Workers (PIN auth)
- `public.time_registrations` - Time entries

**Key constraints**:

- `check_out > check_in` - Temporal validity
- `pin_hash UNIQUE` - PIN uniqueness
- `is_active` - Soft delete
- `status IN ('in_progress', 'completed')` - Valid statuses

**Indexes**:

- `idx_time_registrations_worker_id`
- `idx_time_registrations_check_in`
- `idx_workers_is_active`
- `idx_time_registrations_status`

### D. Użyteczne komendy

```bash
# Start local development
pnpm dev

# Run tests
pnpm test                    # All tests
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests
pnpm test:e2e               # E2E tests
pnpm test:coverage          # With coverage

# Database
supabase start              # Local Supabase
supabase db reset           # Reset + migrations
supabase db seed            # Seed test data

# Linting
pnpm lint                   # ESLint
pnpm type-check            # TypeScript

# Build
pnpm build                  # Production build
pnpm preview               # Preview build
```

### E. Referencje i resources

**Dokumentacja**:

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

**Best practices**:

- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Web.dev Performance](https://web.dev/performance/)

**Tools**:

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [k6 Cloud](https://k6.io/)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-20  
**Author**: AI Test Plan Generator  
**Approved by**: [Pending]

**Change Log**:

- 2025-01-20: Initial version based on MVP scope
