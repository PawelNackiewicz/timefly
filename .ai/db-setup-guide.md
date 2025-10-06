# TimeFly Database Setup Guide

## Przegląd

TimeFly używa PostgreSQL z niestandardowym systemem uwierzytelniania i rozdzielonymi rolami administratorów i pracowników:

- **Administratorzy**: Uwierzytelniają się za pomocą email + kod weryfikacyjny wysyłany mailem, sesje zarządzane w bazie
- **Pracownicy**: Przechowywani w tabeli `workers`, uwierzytelniają się za pomocą PIN-u

## Struktura tabel

### 1. admins

Zawiera administratorów z podstawowymi danymi:

- `id` - klucz główny (UUID)
- `email` - adres email (unikalny)
- `first_name`, `last_name` - dane osobowe
- `department` - dział organizacyjny
- `is_active` - czy administrator jest aktywny
- `created_at`, `updated_at` - znaczniki czasu

### 2. admin_verification_codes

Przechowuje kody weryfikacyjne dla administratorów:

- `id` - klucz główny (UUID)
- `admin_id` - odnosi się do `admins(id)`
- `code` - kod weryfikacyjny (6-cyfrowy)
- `expires_at` - czas wygaśnięcia kodu
- `used_at` - czas użycia kodu (NULL jeśli nieużyty)
- `created_at` - czas utworzenia

### 3. admin_sessions

Zarządza sesjami administratorów:

- `id` - klucz główny (UUID)
- `admin_id` - odnosi się do `admins(id)`
- `session_token` - token sesji (UUID)
- `expires_at` - czas wygaśnięcia sesji
- `created_at` - czas utworzenia sesji
- `last_activity_at` - ostatnia aktywność

### 4. workers

Zawiera pracowników uwierzytelniających się PIN-em:

- `id` - klucz główny (UUID)
- `first_name`, `last_name` - dane osobowe
- `pin_hash` - zahashowany PIN (bcrypt)
- `is_active` - czy pracownik jest aktywny
- `department` - dział organizacyjny
- `created_at`, `updated_at` - znaczniki czasu

### 5. time_registrations

Rejestracje czasu pracy:

- `id` - klucz główny (UUID)
- `worker_id` - odnosi się do `workers(id)`
- `check_in`, `check_out` - znaczniki czasu
- `manual_intervention` - czy była interwencja administratora
- `modified_by_admin_id` - który administrator dokonał modyfikacji
- `created_at`, `updated_at` - znaczniki czasu

## Uruchomienie

1. **Uruchom PostgreSQL lokalnie:**

```bash
# Za pomocą Docker
docker run --name timefly-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=timefly -p 5432:5432 -d postgres:15

# Lub za pomocą lokalnej instalacji PostgreSQL
createdb timefly
```

2. **Zastosuj migracje:**

```bash
# Uruchom pliki migracji w kolejności
psql -d timefly -f migrations/001_create_core_tables.sql
psql -d timefly -f migrations/002_create_functions.sql
psql -d timefly -f migrations/003_create_indexes.sql
```

3. **Załaduj dane testowe:**

```bash
psql -d timefly -f seeds/sample_data.sql
```

## Tworzenie administratora

Administratorzy są tworzone bezpośrednio w tabeli `admins`:

```sql
-- Tworzenie nowego administratora
INSERT INTO admins (id, email, first_name, last_name, department, is_active)
VALUES (gen_random_uuid(), 'admin@company.com', 'Jan', 'Kowalski', 'IT', true);
```

## Uwagi dotyczące bezpieczeństwa

### Uwierzytelnianie administratorów

- Administratorzy logują się przez email + kod weryfikacyjny
- Kody weryfikacyjne są 6-cyfrowe i ważne przez 10 minut
- Sesje mają określony czas wygaśnięcia (domyślnie 24h)
- Tokeny sesji są generowane jako UUID i przechowywane w bazie

### Bezpieczeństwo bazy danych

- Wszystkie hashe PIN-ów używają bcrypt
- Kody weryfikacyjne są usuwane po użyciu
- Nieaktywne sesje są automatycznie czyszczone
- Pracownicy nie mają bezpośredniego dostępu do bazy (tylko przez API)

### API Endpoints

Aplikacja powinna implementować:

**Uwierzytelnianie administratorów:**

- **POST /api/admin/request-code** - żądanie kodu weryfikacyjnego
- **POST /api/admin/verify-code** - weryfikacja kodu i tworzenie sesji
- **POST /api/admin/logout** - wylogowanie i usunięcie sesji

**Zarządzanie pracownikami:**

- **POST /api/worker/checkin** - check-in pracownika z PIN-em
- **POST /api/worker/checkout** - check-out pracownika z PIN-em

**Panel administratora:**

- **GET /api/admin/workers** - lista pracowników (tylko dla adminów)
- **PUT /api/admin/time-registration/:id** - edycja rejestracji (tylko dla adminów)
- **GET /api/admin/reports** - raporty czasu pracy (tylko dla adminów)

## Testowanie

Przykładowe dane seed zawierają:

**Administratorzy:**

- admin@company.com - Jan Kowalski (IT)
- manager@company.com - Anna Nowak (HR)

**Pracownicy:**

- 5 pracowników z różnymi PIN-ami
- Przykładowe rejestracje czasu
- Różne statusy rejestracji

### Testowe PIN-y pracowników:

- Jan Kowalski: `1234`
- Anna Nowak: `5678`
- Piotr Wiśniewski: `9012`
- Maria Kowalczyk: `3456`
- Tomasz Zieliński: `7890`

_Uwaga: To są przykładowe PIN-y, rzeczywiste PIN-y powinny być prawidłowo zahashowane za pomocą bcrypt._

### Testowanie uwierzytelniania administratorów:

1. Wyślij żądanie kodu na email administratora
2. Sprawdź kod w tabeli `admin_verification_codes`
3. Użyj kodu do weryfikacji i otrzymania tokenu sesji
4. Używaj tokenu w nagłówku Authorization dla chronionych endpointów

## Monitoring i KPI

System umożliwia generowanie raportów:

- Liczba rejestracji dziennych/tygodniowych
- Średni czas pracy pracowników
- Interwencje administracyjne
- Aktywność pracowników
- Statystyki logowań administratorów
- Analiza użycia kodów weryfikacyjnych

## Proces uwierzytelniania administratorów

### 1. Żądanie kodu weryfikacyjnego

```sql
-- Generowanie nowego kodu weryfikacyjnego
INSERT INTO admin_verification_codes (id, admin_id, code, expires_at)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM admins WHERE email = $1 AND is_active = true),
    LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'),
    NOW() + INTERVAL '10 minutes'
);
```

### 2. Weryfikacja kodu i tworzenie sesji

```sql
-- Weryfikacja kodu i tworzenie sesji
WITH verified_code AS (
    UPDATE admin_verification_codes
    SET used_at = NOW()
    WHERE code = $1 AND expires_at > NOW() AND used_at IS NULL
    RETURNING admin_id
)
INSERT INTO admin_sessions (id, admin_id, session_token, expires_at)
SELECT
    gen_random_uuid(),
    admin_id,
    gen_random_uuid(),
    NOW() + INTERVAL '24 hours'
FROM verified_code;
```

### 3. Walidacja sesji

```sql
-- Sprawdzanie aktywnej sesji
SELECT a.id, a.email, a.first_name, a.last_name, a.department
FROM admin_sessions s
JOIN admins a ON s.admin_id = a.id
WHERE s.session_token = $1
  AND s.expires_at > NOW()
  AND a.is_active = true;
```

## Następne kroki

Po uruchomieniu MVP można rozszerzyć system o:

- Resetowanie PIN-ów pracowników
- Historie zmian PIN-ów
- Szczegółowe logi audytowe
- Integracje z zewnętrznymi systemami HR
- Dwuetapowe uwierzytelnianie dla administratorów
- Automatyczne czyszczenie wygasłych sesji i kodów
- Powiadomienia email o podejrzanej aktywności
