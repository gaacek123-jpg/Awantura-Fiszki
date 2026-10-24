// Narzędzie dla agenta awantura-generator (i do ręcznego użytku).
//   node narzedzia/dodaj.mjs --statystyki        → liczba pytań w kategoriach + wszystkie odpowiedzi (do unikania dubli)
//   node narzedzia/dodaj.mjs <nowe.json> [--sprawdz] → waliduje i dopisuje pytania do pytania.json (z --sprawdz tylko waliduje)
// Format nowe.json: [{ "k": "Kategoria", "p": "Pytanie?", "o": "Odpowiedź", "h": ["A", "B", "C", "D"],
//                      "w": "Wyjaśnienie (1–3 zdania).", "tm": ["Tytuł artykułu w pl.wikipedii"] }, ...]
// Po dopisaniu: node narzedzia/wzbogac.mjs --wiki (weryfikacja tytułów tm) i node narzedzia/baza-wiedzy.mjs
import { readFileSync } from 'node:fs';
import { KATEGORIE, ZRODLA, wczytaj, zapisz } from './wspolne.mjs';
import { sprawdzPytania } from '../walidacja.js';

const base = wczytaj();
const [arg, flag] = process.argv.slice(2);

if (arg === '--statystyki') {
  const cats = Object.fromEntries(KATEGORIE.map(k => [k, 0]));
  for (const c of base) cats[c.k] = (cats[c.k] || 0) + 1;
  const src = Object.entries(ZRODLA).map(([s, nazwa]) => `${nazwa}: ${base.filter(c => c.src === s).length}`).join(', ');
  console.log(`Pytań: ${base.length} (${src})\n\nKategorie (od najmniej licznych):`);
  for (const [k, n] of Object.entries(cats).sort((a, b) => a[1] - b[1])) console.log(`  ${String(n).padStart(3)}  ${k}`);
  console.log('\nIstniejące pytania ([źródło] kategoria | pytanie → odpowiedź). Wzorem stylu są pytania [program]:');
  for (const c of base) console.log(`  [${c.src || '?'}] ${c.k} | ${c.p} → ${c.o}`);
  process.exit(0);
}
if (!arg) { console.error('Podaj plik z nowymi pytaniami albo --statystyki.'); process.exit(1); }

// Te same reguły co w appce (generator z AI w zakładce „Pytania”) — patrz ../walidacja.js
const fresh = JSON.parse(readFileSync(arg, 'utf8').replace(/^﻿/, ''));
const { ok: valid, errors, warnings } = sprawdzPytania(fresh, base);
const ok = valid.map(c => ({ ...c, src: 'ai' }));

if (warnings.length) console.log('Uwaga — możliwe duble faktów (sprawdź, czy to inne pytanie o to samo):\n  ' + warnings.join('\n  '));
if (errors.length) { console.log(`Odrzucone (${errors.length}):\n  ` + errors.map(e => `#${e.nr} ${e.p}\n     ✗ ${e.powody.join('; ')}`).join('\n  ')); }
if (flag === '--sprawdz') { console.log(`\nPoprawnych: ${ok.length}/${fresh.length} (nic nie zapisano).`); process.exit(errors.length ? 2 : 0); }
if (errors.length) { console.log('\nNic nie zapisano — popraw odrzucone i uruchom ponownie.'); process.exit(2); }

const all = [...base, ...ok];
zapisz(all);
console.log(`Dopisano ${ok.length} pytań → pytania.json ma teraz ${all.length}.`);
