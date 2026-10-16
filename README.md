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
- **Z telefonu:** zakładka „Pytania” → dodaj jedno albo wklej wiele w formacie
  `Kategoria | Pytanie | Odpowiedź | A; B; C; D | link` (dwa ostatnie pola opcjonalne, tabulatory z Excela też działają).
  Pytanie trafia do wspólnej bazy i cała drużyna widzi je po odświeżeniu. Bez internetu czeka w kolejce na telefonie.
- **Do pliku:** `node narzedzia/zrzut.mjs` dopisuje pytania z bazy do `pytania.json`, potem commit + push.
- **Ręcznie:** dopisz do `pytania.json` i zrób push na `main`.

## Wspólna baza
Firebase Realtime Database projektu `plan-dyzurow` (ten sam co Plan sprzątania), gałąź `awantura/pytania`, dostęp przez REST.
Reguły dla tej gałęzi (obok istniejącego `dyzury`):

```json
"awantura": {
  ".read": true,
  "pytania": {
    "$id": {
      ".write": true,
      ".validate": "newData.child('p').isString() && newData.child('p').val().length <= 500 && newData.child('o').isString() && newData.child('o').val().length <= 300"
    }
  }
}
```

Baza jest otwarta, tak jak w Planie sprzątania: kto zna adres, może dopisywać i usuwać pytania. Postęp nauki zostaje tylko na telefonie.
