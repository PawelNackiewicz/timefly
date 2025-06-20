# TimeFly Database Setup Guide

## Przegląd

TimeFly używa Supabase PostgreSQL z rozdzielonymi rolami administratorów i pracowników:

- **Administratorzy**: Używają Supabase Auth (email/hasło) i mają rozszerzone dane w tabeli `admins`
- **Pracownicy**: Przechowywani w tabeli `workers`, uwierzytelniają się za pomocą PIN-u

## Struktura tabel

### 1. auth.users (zarządzana przez Supabase)

Zawiera konta administratorów z uwierzytelnianiem email/hasło.

### 2. admins

Rozszerza dane administratorów o informacje biznesowe:

- `user_id` - odnosi się do `auth.users(id)`
- `first_name`, `last_name` - dane osobowe
- `department` - dział organizacyjny

### 3. workers

Zawiera pracowników uwierzytelniających się PIN-em:

- `pin_hash` - zahashowany PIN (bcrypt)
- `is_active` - czy pracownik jest aktywny
- `department` - dział organizacyjny

### 4. time_registrations

Rejestracje czasu pracy:

- `worker_id` - odnosi się do `workers(id)`
- `check_in`, `check_out` - znaczniki czasu
- `manual_intervention` - czy była interwencja administratora
- `modified_by_admin_id` - który administrator dokonał modyfikacji

## Uruchomienie

1. **Uruchom Supabase lokalnie:**

```bash
supabase start
```

2. **Zastosuj migrację:**

```bash
supabase db reset
```

3. **Sprawdź dane seed:**

```bash
supabase db seed
```

## Tworzenie administratora

Administratorzy muszą najpierw utworzyć konto w Supabase Auth, a następnie aplikacja musi dodać rekord do tabeli `admins`:

```sql
-- Po rejestracji użytkownika w Supabase Auth
INSERT INTO admins (user_id, first_name, last_name, department)
VALUES (auth.uid(), 'Jan', 'Kowalski', 'IT');
```

## Uwagi dotyczące bezpieczeństwa

### Row Level Security (RLS)

- Wszystkie tabele mają włączone RLS
- Administratorzy mogą zarządzać wszystkimi danymi
- Pracownicy nie mają bezpośredniego dostępu do bazy (tylko przez API)

### API Endpoints

Aplikacja powinna implementować:

- **POST /api/worker/checkin** - check-in pracownika z PIN-em
- **POST /api/worker/checkout** - check-out pracownika z PIN-em
- **GET /api/admin/workers** - lista pracowników (tylko dla adminów)
- **PUT /api/admin/time-registration/:id** - edycja rejestracji (tylko dla adminów)

## Testowanie

Przykładowe dane seed zawierają:

- 5 pracowników z różnymi PIN-ami
- Przykładowe rejestracje czasu
- Różne statusy rejestracji

### Testowe PIN-y:

- Jan Kowalski: `1234`
- Anna Nowak: `5678`
- Piotr Wiśniewski: `9012`
- Maria Kowalczyk: `3456`

_Uwaga: To są przykładowe hash-e, rzeczywiste PIN-y powinny być prawidłowo zahashowane._

## Monitoring i KPI

System umożliwia generowanie raportów:

- Liczba rejestracji dziennych/tygodniowych
- Średni czas pracy pracowników
- Interwencje administracyjne
- Aktywność pracowników

## Następne kroki

Po uruchomieniu MVP można rozszerzyć system o:

- Resetowanie PIN-ów
- Historie zmian PIN-ów
- Szczegółowe logi audytowe
- Integracje z zewnętrznymi systemami HR
