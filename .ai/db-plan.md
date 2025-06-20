# Schemat bazy danych dla TimeFly MVP

## 1. Lista tabel

### Tabela: auth.users (zarządzana przez Supabase Auth)

Ta tabela jest automatycznie zarządzana przez Supabase Auth i zawiera administratorów systemu:

- id: UUID PRIMARY KEY
- email: VARCHAR UNIQUE NOT NULL
- encrypted_password: VARCHAR
- email_confirmed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- role: VARCHAR(50) DEFAULT 'authenticated'

### Tabela: admins

Rozszerza informacje o administratorach z tabeli auth.users:

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL UNIQUE -- klucz obcy odnoszący się do auth.users(id)
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- department: VARCHAR(100)
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### Tabela: workers

Tabela zawierająca pracowników, którzy raportują czas pracy:

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- pin_hash: VARCHAR(255) NOT NULL UNIQUE
- department: VARCHAR(100)
- is_active: BOOLEAN NOT NULL DEFAULT true
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### Tabela: time_registrations

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- worker_id: UUID NOT NULL -- klucz obcy odnoszący się do workers(id)
- check_in: TIMESTAMPTZ NOT NULL
- check_out: TIMESTAMPTZ
- status: VARCHAR(50) NOT NULL DEFAULT 'in_progress' -- 'completed', 'in_progress'
- manual_intervention: BOOLEAN NOT NULL DEFAULT false
- modified_by_admin_id: UUID -- klucz obcy odnoszący się do admins(id), null jeśli nie było interwencji
- notes: TEXT -- opcjonalne notatki administratora
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

**Ograniczenia:**

- CHECK (check_out IS NULL OR check_out > check_in)
- CHECK (status IN ('in_progress', 'completed'))
- FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
- FOREIGN KEY (modified_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL

## 2. Relacje między tabelami

- Relacja 1:1 pomiędzy auth.users a admins (jeden użytkownik Supabase Auth = jeden administrator)
- Relacja 1:N pomiędzy workers a time_registrations (jeden pracownik może mieć wiele rejestracji czasu pracy)
- Relacja 1:N pomiędzy admins a time_registrations (jeden administrator może zmodyfikować wiele rejestracji - opcjonalna relacja)

## 3. Indeksy

- Primary Keys na wszystkich tabelach (domyślnie tworzone)
- Indeks UNIQUE na admins.user_id
- Indeks UNIQUE na workers.pin_hash
- Indeks na time_registrations.worker_id (tworzony przez klucz obcy)
- Indeks na time_registrations.modified_by_admin_id (tworzony przez klucz obcy)
- Opcjonalny indeks na time_registrations.check_in dla przyspieszenia zapytań filtrowanych po dacie
- Opcjonalny indeks na workers.is_active dla filtrowania aktywnych pracowników

## 4. Zasady PostgreSQL (RLS)

### Tabela admins:

```sql
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Administratorzy mogą widzieć tylko swoje dane
CREATE POLICY "Admins can view own data" ON admins
    FOR SELECT USING (user_id = auth.uid());

-- Administratorzy mogą aktualizować tylko swoje dane
CREATE POLICY "Admins can update own data" ON admins
    FOR UPDATE USING (user_id = auth.uid());
```

### Tabela workers:

```sql
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Administratorzy mają pełny dostęp do wszystkich pracowników
CREATE POLICY "Admins can manage all workers" ON workers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE user_id = auth.uid()
        )
    );
```

### Tabela time_registrations:

```sql
ALTER TABLE time_registrations ENABLE ROW LEVEL SECURITY;

-- Administratorzy mają pełny dostęp do wszystkich rejestracji
CREATE POLICY "Admins can manage all time registrations" ON time_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE user_id = auth.uid()
        )
    );
```

## 5. Funkcje pomocnicze

### Funkcja sprawdzająca czy użytkownik jest administratorem:

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Funkcja do automatycznego ustawienia modified_by_admin_id:

```sql
CREATE OR REPLACE FUNCTION set_admin_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.manual_intervention = true AND OLD.manual_intervention = false THEN
        NEW.modified_by_admin_id = (
            SELECT id FROM admins WHERE user_id = auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_admin_modification
    BEFORE UPDATE ON time_registrations
    FOR EACH ROW
    EXECUTE FUNCTION set_admin_modification();
```

## 6. Dodatkowe uwagi

- Administratorzy używają systemu uwierzytelniania Supabase Auth (email/hasło)
- Pracownicy używają PIN do rejestracji czasu (bez konta Supabase Auth)
- Separacja ról zapewnia lepsze bezpieczeństwo i skalowalność
- Tabela `admins` rozszerza dane z `auth.users` o dodatkowe informacje biznesowe
- System umożliwia śledzenie, który administrator dokonał modyfikacji rejestracji czasu
- W MVP nie przewidujemy partycjonowania ani materializowanych widoków, co upraszcza początkowy projekt bazy danych
