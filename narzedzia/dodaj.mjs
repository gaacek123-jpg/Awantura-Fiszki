// Narzędzie dla agenta awantura-generator (i do ręcznego użytku).
//   node narzedzia/dodaj.mjs --statystyki        → liczba pytań w kategoriach + wszystkie odpowiedzi (do unikania dubli)
//   node narzedzia/dodaj.mjs <nowe.json> [--sprawdz] → waliduje i dopisuje pytania do pytania.json (z --sprawdz tylko waliduje)
// Format nowe.json: [{ "k": "Kategoria", "p": "Pytanie?", "o": "Odpowiedź", "h": ["A", "B", "C", "D"],
//                      "w": "Wyjaśnienie (1–3 zdania).", "tm": ["Tytuł artykułu w pl.wikipedii"] }, ...]
// Po dopisaniu: node narzedzia/wzbogac.mjs --wiki (weryfikacja tytułów tm) i node narzedzia/baza-wiedzy.mjs
import { readFileSync } from 'node:fs';
import { KATEGORIE, ZRODLA, id, wczytaj, zapisz } from './wspolne.mjs';

const plain = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, ' ').trim();

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

const fresh = JSON.parse(readFileSync(arg, 'utf8').replace(/^﻿/, ''));
const known = new Set(base.map(c => id(c.p)));
const answers = new Map(base.map(c => [plain(c.o), c.p]));
const ok = [], errors = [], warnings = [];
for (const [i, raw] of fresh.entries()) {
  const n = `#${i + 1}`;
  const c = { k: String(raw.k || '').trim(), p: String(raw.p || '').trim(), o: String(raw.o || '').trim(),
              h: Array.isArray(raw.h) ? raw.h.map(x => String(x).trim()) : null,
              w: String(raw.w || '').trim(), tm: Array.isArray(raw.tm) ? raw.tm.map(x => String(x).trim()).filter(Boolean) : [] };
  const err = [];
  if (!c.w || c.w.length > 500) err.push('wyjaśnienie w: 1–3 zdania, do 500 znaków');
  if (!c.tm.length || c.tm.length > 3) err.push('tm: 1–3 tytuły artykułów z polskiej Wikipedii');
  if (!KATEGORIE.includes(c.k)) err.push(`nieznana kategoria „${c.k}”`);
  if (!c.p.endsWith('?')) err.push('pytanie nie kończy się „?”');
  if (c.p.length < 15 || c.p.length > 400) err.push('pytanie za krótkie/za długie');
  if (!c.o || c.o.length > 120) err.push('brak odpowiedzi albo za długa');
  if (!c.h || c.h.length !== 4 || new Set(c.h.map(plain)).size !== 4) err.push('podpowiedź musi mieć 4 różne warianty');
  else if (!c.h.some(h => h.toLowerCase() === c.o.toLowerCase())) err.push('odpowiedź nie jest jednym z wariantów podpowiedzi');
  if (known.has(id(c.p))) err.push('takie pytanie już jest');
  if (err.length) { errors.push(`${n} ${c.p}\n     ✗ ${err.join('; ')}`); continue; }
  if (answers.has(plain(c.o))) warnings.push(`${n} ta sama odpowiedź „${c.o}” co w: ${answers.get(plain(c.o))}`);
  known.add(id(c.p));
  ok.push({ ...c, src: 'ai' });
}

if (warnings.length) console.log('Uwaga — możliwe duble faktów (sprawdź, czy to inne pytanie o to samo):\n  ' + warnings.join('\n  '));
if (errors.length) { console.log(`Odrzucone (${errors.length}):\n  ` + errors.join('\n  ')); }
if (flag === '--sprawdz') { console.log(`\nPoprawnych: ${ok.length}/${fresh.length} (nic nie zapisano).`); process.exit(errors.length ? 2 : 0); }
if (errors.length) { console.log('\nNic nie zapisano — popraw odrzucone i uruchom ponownie.'); process.exit(2); }

const all = [...base, ...ok];
zapisz(all);
console.log(`Dopisano ${ok.length} pytań → pytania.json ma teraz ${all.length}.`);
