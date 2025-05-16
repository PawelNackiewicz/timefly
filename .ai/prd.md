# Dokument wymagań produktu (PRD) - TimeFly

## 1. Przegląd produktu

TimeFly to aplikacja do rejestracji czasu pracy oparta na procesie check-in/check-out z weryfikacją PIN-em. System umożliwia automatyczną rejestrację czasu pracy pracowników przy użyciu prostego mechanizmu PIN. Dodatkowo, administratorzy mają możliwość ręcznej interwencji: inicjowania, kończenia oraz edycji rejestracji. Interfejs jest responsywny, webowy i zoptymalizowany pod kątem urządzeń mobilnych z uwzględnieniem standardów dostępności. Aplikacja zawiera listę pracowników z funkcjonalnością wyszukiwania i filtrowania oraz panel administracyjny prezentujący podstawowe KPI. System monitoruje dedykowane URL-e, generując alerty przy wykryciu anomalii. Architektura została zaprojektowana modułowo, z myślą o przyszłym rozwoju, jednak zaawansowane zabezpieczenia, takie jak resetowanie czy wymuszanie zmiany PIN, pozostają poza zakresem MVP.

## 2. Problem użytkownika

Użytkownicy, zarówno pracownicy, jak i administratorzy, potrzebują szybkiego i niezawodnego sposobu rejestracji czasu pracy. Pracownicy często napotykają trudności związane z ręcznym rejestrowaniem czasu, co może prowadzić do błędów i opóźnień. Administratorzy natomiast muszą poświęcać dużo czasu na interwencje w proces rejestracji, co zwiększa ryzyko manipulacji danymi oraz wydłuża czas administracyjny. System TimeFly ma na celu redukcję tych problemów poprzez automatyzację procesu rejestracji oraz zapewnienie mechanizmów ręcznej interwencji w razie potrzeby, co ma prowadzić do redukcji czasu administracyjnego o minimum 30%.

## 3. Wymagania funkcjonalne

- Rejestracja czasu pracy przez proces check-in/check-out z weryfikacją PIN-em.
- Możliwość ręcznej interwencji przez administratora (rozpoczęcie, zakończenie, edycja rejestracji czasu pracy).
- Responsywny, webowy interfejs zoptymalizowany dla urządzeń mobilnych z uwzględnieniem standardów dostępności.
- Lista pracowników umożliwiająca wyszukiwanie i filtrowanie według kryteriów, takich jak imię, nazwisko czy dział.
- Panel administracyjny prezentujący kluczowe KPI, m.in. liczbę udanych rejestracji oraz średni czas operacji.
- Monitorowanie dedykowanych URL-i z mechanizmem generowania alertów w przypadku wykrycia anomalii.
- Modułowa architektura umożliwiająca przyszły rozwój, m.in. dodanie zaawansowanych funkcji logowania czy resetowania PIN-u.
- Uwierzytelnianie użytkownika oparte na PIN-ie, zapewniające podstawowy poziom bezpieczeństwa.

## 4. Granice produktu

- Zaawansowane mechanizmy bezpieczeństwa (np. resetowanie PIN, wymuszanie zmiany PIN) nie są częścią MVP.
- Rozbudowane funkcje integracji z innymi systemami (np. moduły zarządzania zadaniami, projektami, czy audyt i szczegółowe raportowanie) pozostają poza zakresem projektu.
- Funkcjonalności wykraczające poza podstawową rejestrację czasu pracy oraz monitorowanie KPI zostaną uwzględnione w przyszłych wersjach, nie w MVP.

## 5. Historyjki użytkowników

### US-001

ID: US-001

Tytuł: Rejestracja check-in/check-out przez pracownika

Opis: Jako pracownik chcę móc zarejestrować swój czas pracy poprzez proces check-in/check-out, używając PIN-u do weryfikacji, aby szybko i poprawnie zarejestrować rozpoczęcie i zakończenie pracy.

Kryteria akceptacji:

- Pracownik wprowadza poprawny PIN.
- System rejestruje czas rozpoczęcia (check-in) oraz zakończenia (check-out).
- W przypadku błędnego PIN-u system wyświetla komunikat o błędzie.

### US-002

ID: US-002

Tytuł: Wyszukiwanie i filtrowanie pracowników

Opis: Jako użytkownik chcę mieć możliwość wyszukiwania i filtrowania listy pracowników według imienia, nazwiska lub działu, aby szybko znaleźć właściwe konto.

Kryteria akceptacji:

- Interfejs umożliwia wprowadzenie kryterium wyszukiwania.
- Lista pracowników dynamicznie filtruje się zgodnie z wpisanym kryterium.
- Wyniki wyszukiwania zawierają kluczowe informacje o pracowniku.

### US-003

ID: US-003

Tytuł: Manualne rozpoczęcie rejestracji przez administratora

Opis: Jako administrator chcę móc ręcznie rozpocząć rejestrację czasu pracy dla pracownika, gdy automatyczny proces zawodzi lub wymaga interwencji.

Kryteria akceptacji:

- Administrator ma opcję manualnego zainicjowania procesu check-in.
- System potwierdza rozpoczęcie rejestracji.
- Akcja jest rejestrowana w logach systemowych.

### US-004

ID: US-004

Tytuł: Manualne zakończenie rejestracji przez administratora

Opis: Jako administrator chcę mieć możliwość ręcznego zakończenia rejestracji czasu pracy, aby korygować ewentualne błędy lub zakończyć rejestrację przed czasem.

Kryteria akceptacji:

- Administrator może zakończyć proces rejestracji.
- System zapisuje godzinę zakończenia rejestracji.
- Działanie jest widoczne w panelu administracyjnym.

### US-005

ID: US-005

Tytuł: Manualna edycja rejestracji przez administratora

Opis: Jako administrator chcę móc edytować rejestrację czasu pracy, aby poprawić błędy w zapisie.

Kryteria akceptacji:

- Administrator wybiera istniejącą rejestrację i wprowadza korekty.
- Zmiany są odzwierciedlone w historii rejestracji.
- System oznacza rejestracje, które zostały edytowane.

### US-006

ID: US-006

Tytuł: Bezpieczne uwierzytelnianie przy użyciu PIN-u

Opis: Jako użytkownik chcę, aby proces logowania wykorzystywał PIN, zapewniając bezpieczeństwo dostępu do systemu.

Kryteria akceptacji:

- System weryfikuje poprawność PIN-u przed udzieleniem dostępu.
- Proces uwierzytelniania spełnia podstawowe standardy bezpieczeństwa.

## 6. Metryki sukcesu

- Redukcja czasu administracyjnego o minimum 30%.
- Skrócenie średniego czasu operacji rejestracji.
- Pozytywne opinie użytkowników dotyczące responsywności i dostępności interfejsu.
