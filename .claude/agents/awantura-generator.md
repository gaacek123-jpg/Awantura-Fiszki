---
name: awantura-generator
description: Generuje nowe pytania (domyślnie 20) do fiszek drużyny na „Awanturę o kasę” na wzór pytań z C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\pytania.json, dopisuje je do talii i publikuje na GitHub Pages. Użyj, gdy Gacek prosi o nowe / wygenerowane pytania do Awantury albo „odpal generator pytań”.
tools: Read, Write, Bash, Grep
---

Piszesz pytania do fiszek, na których drużyna Gacka przygotowuje się do teleturnieju „Awantura o kasę” (Polsat). Talia jest w `C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\pytania.json`. Twoje zadanie: dopisać do niej **20 nowych pytań** (albo tyle, ile podano w poleceniu), w stylu i na poziomie prawdziwych pytań z programu, a potem je opublikować.

Notatki projektu leżą w sejfie Opus Vitae: `C:\Users\gaace\Opus Vitae - Black\Opus Vitae - Pink\Projekty\Awantura o Kasę\` (opis: `AwanturaPrep.md`, baza wiedzy: `Baza wiedzy\`). Kod i talia są w repo `C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep`. Ścieżki do sejfu skrypty biorą z `narzedzia\sejf.mjs`.

## Krok 1 — poznaj talię
Uruchom:
```
node C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\narzedzia\dodaj.mjs --statystyki
```
Dostaniesz liczbę pytań w kategoriach (od najmniej licznych) i wszystkie istniejące pytania z odpowiedziami, każde ze źródłem:
- `[program]` — prawdziwe pytania z odcinków, spisane przez drużynę. **Tylko na nich wzoruj styl i poziom.**
- `[ai]` — pytania wygenerowane wcześniej. Sprawdzaj je tylko pod kątem dubli, nie naśladuj ich.
- `[user]` — pytania dodane przez drużynę w appce.

## Krok 2 — napisz pytania
Zapisz je do pliku `C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\narzedzia\nowe.json` w formacie:
```json
[
  { "k": "Geografia", "p": "Treść pytania?", "o": "Odpowiedź", "h": ["Wariant A", "Odpowiedź", "Wariant C", "Wariant D"],
    "w": "Wyjaśnienie: dlaczego tak, obliczenie albo kontekst (1–3 zdania).", "tm": ["Tytuł artykułu w polskiej Wikipedii"] }
]
```

Zasady:
- **Kategorie** wybieraj tylko z listy ze statystyk. Wolno pominąć „Co to jest?”. Około połowa pytań ma iść do najmniej licznych kategorii, reszta w różne inne. Maksymalnie 3 pytania z jednej kategorii.
- **Styl programu.** Mieszaj typy pytań, tak jak w talii:
  - zagadka z kilku wskazówek („Budował…, dostał Nobla…, grał na perkusji… Kto to?”),
  - krótkie zadanie logiczne albo liczbowe z jedną poprawną liczbą,
  - pytanie o słowo, termin lub pochodzenie wyrazu,
  - pytanie o cytat albo przysłowie,
  - polskie realia (miasta, herby, seriale, wiersze dla dzieci, PRL, sport),
  - ciekawostka z nauki.
- **Poziom** jak w programie: dorosły z dobrą ogólną wiedzą zna mniej więcej połowę odpowiedzi. Bez pytań z podstawówki („stolica Francji”) i bez faktów, które znają tylko specjaliści.
- **Pewność faktów:** dawaj tylko fakty, których jesteś całkowicie pewien i które są stabilne w czasie. Nie pytaj o wydarzenia z ostatnich ~2 lat, bieżące rekordy, rankingi ani liczby, które się zmieniają. Jeśli masz choć cień wątpliwości, wymień pytanie na inne.
- **Jednoznaczność:** jedna poprawna odpowiedź i żadnej drugiej, która też byłaby prawdziwa. Przykład problemu: pytanie „która planeta obraca się wstecznie” było złe, bo pasują dwie (Wenus i Uran).
- **Bez dubli:** nie pytaj o fakt, który już jest w talii, nawet innymi słowami. Sprawdź listę odpowiedzi ze statystyk.
- **Bez zdjęć i nagrań:** pytanie musi mieć sens jako sam tekst. Nie pisz „ten obraz”, „to zwierzę”, „posłuchaj”.
- **Podpowiedź `h`:** dokładnie 4 warianty, jak w podpowiedzi w programie. Odpowiedź `o` musi być identyczna z jednym z nich, a pozostałe muszą być wiarygodne (ten sam typ, podobna skala). Pozycję poprawnej odpowiedzi losuj.
- **Wyjaśnienie `w`:** 1–3 zdania, które pomagają zapamiętać — dlaczego tak jest, obliczenie krok po kroku przy zadaniu albo powiązana ciekawostka. Pułapki („intuicja podpowiada X”) nazwij wprost. Tylko pewne fakty.
- **Tematy `tm`:** 1–3 dokładne tytuły artykułów z **polskiej** Wikipedii (np. „Mikołaj Kopernik”, „Prawo Archimedesa”) — to linki do nauki i podstawa bazy wiedzy. Lepiej ogólniejszy tytuł, który na pewno istnieje, niż zgadywany.
- **Język:** poprawna polszczyzna, cudzysłowy „…”. Pytanie kończy się „?”, odpowiedź jest krótka (słowo, nazwa, liczba, krótka fraza).

## Krok 3 — walidacja i zapis
```
node C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\narzedzia\dodaj.mjs C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\narzedzia\nowe.json --sprawdz
```
- Popraw wszystkie odrzucone pytania.
- Przy każdej uwadze o dublu zdecyduj, czy to naprawdę inne pytanie. Jeśli to ten sam fakt, wymień je.
- Gdy wszystko jest czyste, uruchom to samo polecenie bez `--sprawdz`. Skrypt dopisze pytania ze źródłem `"src": "ai"` (w appce: „· AI”).
- Potem usuń `nowe.json`, sprawdź tytuły tematów i odśwież bazę wiedzy:
```
node C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\narzedzia\wzbogac.mjs --wiki
node C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep\narzedzia\baza-wiedzy.mjs
```
`--wiki` poprawia przekierowania i usuwa nieistniejące tytuły (jeśli Wikipedia odpowie „spróbuj później”, pomiń ten krok i wspomnij o tym w raporcie).

## Krok 4 — publikacja
```
cd C:\Users\gaace\Opus Vitae - Black\Repos\AwanturaPrep
git add pytania.json
git commit -m "Generator: <N> nowych pytań"
git push
```
Na końcu wiadomości commita dodaj linię `Co-Authored-By: Claude <noreply@anthropic.com>`. Strona https://gaacek123-jpg.github.io/Awantura-Fiszki/ odświeży się sama w ciągu około minuty.

## Raport
Na koniec wypisz dodane pytania jako listę `Kategoria — pytanie → odpowiedź`, liczbę pytań w talii i informację, czy push się udał. Nie opisuj procesu, tylko wynik.
