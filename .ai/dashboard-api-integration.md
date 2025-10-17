# Dashboard API Integration

## ✅ Zintegrowane z API

### 1. Dashboard Statistics (GET `/api/admin/dashboard/stats`)

Główne statystyki dashboard zostały w pełni zintegrowane:

- **Total Employees** - liczba wszystkich pracowników

  - Źródło: `stats.workers.total`
  - Trend: pokazuje liczbę aktywnych pracowników

- **Currently Working** - pracownicy obecnie zalogowani

  - Źródło: `stats.workers.with_active_registration`
  - Trend: procent zalogowanych względem wszystkich

- **Hours Today** - suma godzin dzisiaj

  - Źródło: `stats.recent_activity.today_hours`
  - Trend: liczba rejestracji dzisiaj

- **Avg. Hours/Employee** - średnia godzin na pracownika
  - Obliczane: `today_hours / total_employees`
  - Trend: średnia godzin na rejestrację

### 2. Currently Working List (GET `/api/workers/active`)

Lista pracowników aktualnie zalogowanych:

- Pobiera wszystkich aktywnych pracowników
- Filtruje tych z `has_active_registration === true`
- Pokazuje imię, nazwisko, dział
- Auto-refresh co 10 sekund

### 3. Recent Time Entries (GET `/api/admin/dashboard/recent-entries`)

Ostatnie wpisy czasu pracy:

- Pobiera `n` ostatnich rejestracji (domyślnie 10)
- Pokazuje: pracownika, check-in, check-out, czas trwania, status
- Wskaźnik interwencji manualnej (⚠️)
- Auto-refresh co 15 sekund

## ❌ Wymaga nowych API Endpointów

### 1. Work Hours Chart (Wykres godzin w tygodniu)

**Aktualny stan:**

- Używa mock danych z Zustand store
- Oznaczony badge "Mock data - API needed"

**Potrzebny endpoint:**

```typescript
GET /api/admin/dashboard/weekly-hours?week_start=YYYY-MM-DD

Response:
{
  success: true,
  data: {
    daily_hours: [
      { date: "2025-01-13", day: "Mon", hours: 45.5 },
      { date: "2025-01-14", day: "Tue", hours: 38.2 },
      // ... dla każdego dnia tygodnia
    ]
  }
}
```

**Wymagania:**

- Agregacja godzin dla każdego dnia tygodnia
- Tylko completed registrations
- Suma dla wszystkich pracowników

### 2. Hours by Department (Godziny po działach)

**Aktualny stan:**

- Używa procentowego podziału mock danych
- Oznaczony notatką "Department breakdown is estimated. API endpoint needed for accurate data."

**Potrzebny endpoint:**

```typescript
GET /api/admin/dashboard/department-hours?date=YYYY-MM-DD

Response:
{
  success: true,
  data: {
    departments: [
      {
        name: "Operations",
        hours: 120.5,
        percentage: 45.2,
        workers_count: 15
      },
      {
        name: "Administration",
        hours: 80.3,
        percentage: 30.1,
        workers_count: 10
      },
      // ... dla każdego działu
    ],
    total_hours: 266.5
  }
}
```

**Wymagania:**

- Grupowanie po działach
- Obliczanie sum godzin dla każdego działu
- Procent z całości
- Liczba pracowników w dziale

### 3. Trend Data (Dane porównawcze)

**Aktualnie:**

- Trendy są zastąpione statycznymi danymi lub wartościami pochodnymi

**Potrzebne dodatkowe pola w `/api/admin/dashboard/stats`:**

```typescript
{
  // Istniejące pola...
  trends: {
    workers: {
      change_from_last_month: 2,  // +2 pracowników
      change_percentage: 5.3       // +5.3%
    },
    hours_today: {
      change_from_yesterday: -3.5,  // -3.5 godzin
      change_percentage: -8.2       // -8.2%
    },
    avg_hours: {
      change_from_last_week: 0.5,
      change_percentage: 12.5
    }
  }
}
```

## Features Zaimplementowane

### Auto-refresh

- Dashboard stats: co 30 sekund
- Currently working: co 10 sekund
- Recent entries: co 15 sekund

### Loading States

- Skeleton loaders dla statystyk
- Spinner dla listy pracowników
- Loading indicator dla tabeli

### Error Handling

- Graceful fallback dla brakujących danych
- Wartości domyślne (0) gdy brak danych

### Visual Indicators

- 🟢 Zielony punkt dla aktywnych pracowników
- ⚠️ Ostrzeżenie dla interwencji manualnych
- 🔴 Badge dla mock danych

### Dark Mode Support

- Wszystkie komponenty wspierają dark mode
- Odpowiednie kolory dla statusów

## Struktura Komponentów

```
DashboardWrapper (QueryProvider)
  └── Dashboard
      ├── StatsCard (x4) - zintegrowane z API
      ├── WorkHoursChart - WYMAGA API
      ├── Currently Working List - zintegrowane z API
      ├── Quick Actions - statyczne
      ├── Today's Stats (departments) - WYMAGA API
      └── RecentTimeEntries - zintegrowane z API
```

## Następne Kroki

### Priorytet Wysoki

1. **Weekly Hours Endpoint** - najważniejszy dla wykresu
2. **Department Hours Endpoint** - istotne dla kierownictwa

### Priorytet Średni

3. **Trend Data** - wartość dodana, ale nie krytyczne

### Opcjonalne

4. **Real-time Updates via WebSocket** - zamiast polling
5. **Caching Strategy** - Redis dla często używanych danych
6. **Export Functionality** - eksport statystyk do PDF/Excel

## Testing Checklist

Dashboard został zaktualizowany z następującymi funkcjami do przetestowania:

- [ ] Statystyki ładują się poprawnie z API
- [ ] Loading states wyświetlają się podczas ładowania
- [ ] Lista aktywnych pracowników aktualizuje się w czasie rzeczywistym
- [ ] Recent entries pokazują prawidłowe dane
- [ ] Dark mode działa poprawnie
- [ ] Auto-refresh nie powoduje migotania UI
- [ ] Mock data jest wyraźnie oznaczona
- [ ] Brak błędów w konsoli
- [ ] Responsywność na mobile
- [ ] Graceful handling gdy brak danych

## API Endpoints Used

| Endpoint                              | Method | Purpose                     | Refresh Interval |
| ------------------------------------- | ------ | --------------------------- | ---------------- |
| `/api/admin/dashboard/stats`          | GET    | Główne statystyki KPI       | 30s              |
| `/api/workers/active`                 | GET    | Lista aktywnych pracowników | 10s              |
| `/api/admin/dashboard/recent-entries` | GET    | Ostatnie wpisy              | 15s              |

## Known Limitations

1. **Work Hours Chart** - używa mock danych ze store'a
2. **Department Breakdown** - używa procentowego oszacowania
3. **Trends** - brak rzeczywistych danych porównawczych
4. **Historical Data** - brak widoku dla poprzednich okresów
