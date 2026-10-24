# Awantura o kasę — fiszki

Fiszki dla naszej drużyny przed występem w „Awanturze o kasę”. Statyczna web appka (PWA). Działa na iPhonie i Androidzie, także offline.

**Link:** https://gaacek123-jpg.github.io/Awantura-Fiszki/

## Instalacja na telefonie
- **iPhone (Safari):** Udostępnij → „Dodaj do ekranu początkowego”.
- **Android (Chrome):** menu ⋮ → „Dodaj do ekranu głównego” / „Zainstaluj aplikację”.

## Jak działa
- **Runda:** wybierasz źródło pytań, kategorie, czas na odpowiedź (domyślnie 60 s) i liczbę pytań.
- **Maraton:** pytania bez końca, błędne wracają po 6 kolejnych.
- **Powtórki:** tylko pytania z ostatnią złą odpowiedzią.
- **Podpowiedź:** każde pytanie ma 4 warianty. Odpowiedź z podpowiedzią zalicza się, ale nie awansuje pytania (system Leitnera, poziomy 0–4) i liczy się w statystykach za pół punktu.
- **Po odkryciu odpowiedzi:** wyjaśnienie i tematy do poczytania (linki do polskiej Wikipedii).
- **Statystyki:** skuteczność, mocne i słabe strony, co poczytać, a dla drużyny „kto w czym najmocniejszy”. Wymagają podania imienia; odpowiedzi trafiają do wspólnej bazy.
- Postęp nauki zostaje na telefonie, a odpowiedzi do statystyk idą do bazy.

## Generowanie pytań z AI (dla całej drużyny)
Zakładka „Pytania” → **Generuj z AI**: wybierasz kategorię i liczbę pytań, a „Kopiuj prompt” składa gotowe polecenie (przykłady prawdziwych pytań z programu i lista tego, co już jest, żeby nie było dubli). Wklejasz je w dowolny czat AI (Claude, ChatGPT, Gemini), a odpowiedź wklejasz z powrotem. Appka sprawdza pytania tymi samymi regułami co `narzedzia/dodaj.mjs` (wspólny moduł `walidacja.js`), poprawia tytuły Wikipedii i wysyła dobre pytania do wspólnej bazy jako „AI · od: imię”. `node narzedzia/zrzut.mjs` przenosi je do `pytania.json` ze źródłem `ai` i autorem.

## Pola pytania (`pytania.json`)
`k` kategoria · `p` pytanie · `o` odpowiedź · `h` 4 warianty podpowiedzi · `w` wyjaśnienie · `tm` tytuły artykułów polskiej Wikipedii · `src` źródło (`program` / `ai` / `user`) · `a` autor (pytania od drużyny i z generatora w appce).

## Narzędzia (`narzedzia/`)
| Skrypt | Do czego |
|---|---|
| `import-notatki.mjs [--zapisz]` | pytania z odcinków z notatki Obsidiana → `src: program` |
| `dodaj.mjs plik.json` / `--statystyki` | walidacja i dopisanie pytań od generatora → `src: ai` |
| `wzbogac.mjs --stan / --eksport / plik.json / --wiki` | uzupełnianie `h`, `w`, `tm` i weryfikacja tytułów w Wikipedii |
| `zrzut.mjs` | pytania dodane w appce (baza) → `pytania.json` + lista zgłoszeń |
| `baza-wiedzy.mjs` | sejf Obsidiana „Baza wiedzy”: notatka na kategorię z tematami i kartami pytań |
| `analiza.mjs` | analiza odpowiedzi drużyny → notatki w „Baza wiedzy/Analizy” |
| `oczysc-transkrypt.mjs` | czyszczenie transkryptu odcinka (YouTube, .srt, .vtt) |

Agenci Claude Code: `.claude/agents/awantura-generator.md` (nowe pytania) i `awantura-transkrypt.md` (pytania z transkryptów).

## Wspólna baza
Firebase Realtime Database projektu `plan-dyzurow` (ten sam co Plan sprzątania), gałąź `awantura/`, dostęp przez REST.
Reguły (obok istniejącego `dyzury`):

```json
"awantura": {
  ".read": true,
  "pytania": {
    "$id": {
      ".write": true,
      ".validate": "newData.child('p').isString() && newData.child('p').val().length <= 500 && newData.child('o').isString() && newData.child('o').val().length <= 300"
    }
  },
  "zgloszenia": {
    "$id": {
      ".write": true,
      ".validate": "newData.child('u').isString() && newData.child('u').val().length <= 1000"
    }
  },
  "odpowiedzi": {
    "$osoba": {
      "$id": {
        ".write": true,
        ".validate": "newData.hasChildren(['q', 'ok', 't']) && newData.child('q').isString() && newData.child('q').val().length <= 20"
      }
    }
  }
}
```

## Zgłaszanie błędów
Po odkryciu odpowiedzi jest przycisk „⚑ Zgłoś błąd w tym pytaniu”. Zgłoszenie widać na karcie przy tym pytaniu i na liście w zakładce „Pytania”.
`node narzedzia/zrzut.mjs` też wypisuje otwarte zgłoszenia. Po poprawce w `pytania.json` kliknij „Załatwione”.

Baza jest otwarta, tak jak w Planie sprzątania: kto zna adres, może dopisywać i usuwać pytania oraz widzi statystyki drużyny (imiona i odpowiedzi).
