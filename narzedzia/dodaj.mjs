// Narzędzie dla agenta awantura-generator (i do ręcznego użytku).
//   node narzedzia/dodaj.mjs --statystyki        → liczba pytań w kategoriach + wszystkie odpowiedzi (do unikania dubli)
//   node narzedzia/dodaj.mjs <nowe.json> [--sprawdz] → waliduje i dopisuje pytania do pytania.json (z --sprawdz tylko waliduje)
// Format nowe.json: [{ "k": "Kategoria", "p": "Pytanie?", "o": "Odpowiedź", "h": ["A", "B", "C", "D"] }, ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../pytania.json', import.meta.url));
export const KATEGORIE = ['Anatomia i medycyna', 'Astronomia', 'Biologia', 'Chemia', 'Czasy współczesne', 'Film', 'Filozofia i religie',
  'Fizyka', 'Geografia', 'Historia', 'Język polski', 'Kulinaria', 'Literatura', 'Matematyka', 'Motoryzacja', 'Muzyka klasyczna',
  'Muzyka rozrywkowa', 'Piłka nożna', 'Polityka i gospodarka', 'Popkultura', 'Przysłowia i cytaty', 'Rozmaitości', 'Seriale',
  'Sport', 'Sztuka', 'Technologie', 'Wędkarstwo'];

// Ten sam hash co w index.html — duplikat = ta sama treść pytania
const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)) | 0; return 'q' + (h >>> 0).toString(36); };
const id = p => hash(String(p).trim().toLowerCase());
const plain = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, ' ').trim();

const base = JSON.parse(readFileSync(FILE, 'utf8'));
const [arg, flag] = process.argv.slice(2);

if (arg === '--statystyki') {
  const cats = Object.fromEntries(KATEGORIE.map(k => [k, 0]));
  for (const c of base) cats[c.k] = (cats[c.k] || 0) + 1;
  console.log(`Pytań: ${base.length} (w tym wygenerowanych: ${base.filter(c => c.ai).length})\n\nKategorie (od najmniej licznych):`);
  for (const [k, n] of Object.entries(cats).sort((a, b) => a[1] - b[1])) console.log(`  ${String(n).padStart(3)}  ${k}`);
  console.log('\nIstniejące pytania (kategoria | pytanie → odpowiedź):');
  for (const c of base) console.log(`  ${c.k} | ${c.p} → ${c.o}`);
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
              h: Array.isArray(raw.h) ? raw.h.map(x => String(x).trim()) : null };
  const err = [];
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
  ok.push({ ...c, ai: true });
}

if (warnings.length) console.log('Uwaga — możliwe duble faktów (sprawdź, czy to inne pytanie o to samo):\n  ' + warnings.join('\n  '));
if (errors.length) { console.log(`Odrzucone (${errors.length}):\n  ` + errors.join('\n  ')); }
if (flag === '--sprawdz') { console.log(`\nPoprawnych: ${ok.length}/${fresh.length} (nic nie zapisano).`); process.exit(errors.length ? 2 : 0); }
if (errors.length) { console.log('\nNic nie zapisano — popraw odrzucone i uruchom ponownie.'); process.exit(2); }

const all = [...base, ...ok];
writeFileSync(FILE, '[\n' + all.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n');
console.log(`Dopisano ${ok.length} pytań → pytania.json ma teraz ${all.length}.`);
