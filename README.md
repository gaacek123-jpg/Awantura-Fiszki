# Awantura o kasę — fiszki

Fiszki dla naszej drużyny przed występem w „Awanturze o kasę”. Statyczna web appka (PWA). Działa na iPhonie i Androidzie, także offline.

**Link:** https://gaacek123-jpg.github.io/Awantura-Fiszki/

## Instalacja na telefonie
- **iPhone (Safari):** Udostępnij → „Dodaj do ekranu początkowego”.
- **Android (Chrome):** menu ⋮ → „Dodaj do ekranu głównego” / „Zainstaluj aplikację”.

## Jak działa
- Runda: wybierasz kategorie, czas na odpowiedź (domyślnie 60 s) i liczbę pytań. Przy pytaniach z 4 wariantami jest przycisk „Podpowiedź”.
- „Wiedziałem” przesuwa pytanie wyżej (system Leitnera, poziomy 0–4). „Nie wiedziałem” wrzuca je do powtórki.
- Postęp i dopisane pytania zapisują się tylko na danym telefonie (localStorage).

## Dodawanie pytań
- **Dla wszystkich:** dopisz do `pytania.js` i zrób push na `main`. Strona zaktualizuje się sama.
- **Z telefonu:** zakładka „Pytania” → dodaj jedno albo wklej wiele w formacie
  `Kategoria | Pytanie | Odpowiedź | A; B; C; D | link` (dwa ostatnie pola opcjonalne, tabulatory z Excela też działają).
  „Kopiuj / wyślij” daje tekst, który reszta drużyny wkleja u siebie w import.
