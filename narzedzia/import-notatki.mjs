// Importuje pytania z odcinków, spisane w notatce Obsidiana, do pytania.json jako src: "program".
//   node narzedzia/import-notatki.mjs            → podgląd (nic nie zapisuje)
//   node narzedzia/import-notatki.mjs --zapisz   → dopisuje nowe pytania i oznacza istniejące jako "program"
// Format notatki: bloki „Pytanie: … / Kategoria: … / Odpowiedź: …” (pogrubienia ** są ignorowane).
// Pytania wymagające zdjęcia lub nagrania („Co to jest?”, „ten obraz”, „ta aria”…) są pomijane.
import { readFileSync } from 'node:fs';
import { KATEGORIE, id, wczytaj, zapisz } from './wspolne.mjs';

const NOTATKA = process.env.AWANTURA_NOTATKA || 'C:\\Users\\gaace\\ProjectsVault\\Personal\\Awantura o Kasę\\Awantura - pytania.md';

const byLower = Object.fromEntries(KATEGORIE.map(c => [c.toLowerCase(), c]));
function kategoria(raw) {
  let c = raw.replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, '');
  c = c.replace(/\(Jeden na jednego\)/i, '').replace(/^Weź,? co chcesz\??\s*([-,]\s*)?/i, '').replace(/^Jeden na (jeden|jednego)\s*[-,]\s*/i, '').trim();
  if (!c) return 'Rozmaitości';
  return byLower[c.toLowerCase()] || c;
}
// Literówki z notatki — poprawiane przy imporcie (zmiana treści = inne id, więc lista musi zostać, inaczej powstaną duble)
const POPRAWKI = [[/pierwsiastka/g, 'pierwiastka'], [/sformułowałm/g, 'sformułował'], [/Kolejne roznicę/g, 'Kolejne rocznice'],
  [/źółtkami/g, 'żółtkami'], [/Payton Place/g, 'Peyton Place'], [/Guinessa/g, 'Guinnessa'], [/kobietą wierząca/g, 'kobietą wierzącą'],
  [/ jakie to miasto/g, ' Jakie to miasto'], [/„Po drugiej stronie\?/g, '„Po drugiej stronie”?'], [/Które\?/g, 'Które?']];
const popraw = s => POPRAWKI.reduce((t, [a, b]) => t.replace(a, b),
  s.replace(/\s+/g, ' ').trim().replace(/Pytanie:\s*/g, '').replace(/\?\.$/, '?'));
const MEDIA = /^co to jest\??$|to zwierzę|ten obraz|ta aria|na tym zdjęciu|ta budowla|^Ten zawodnik|^Te buty|tego ołtarza|ta rzeźba|tego budynku|ten utwór\?/i;

const text = readFileSync(NOTATKA, 'utf8').replace(/\*\*/g, '');
const re = /Pytanie:\s*([\s\S]*?)\s*Kategoria:\s*([\s\S]*?)\s*Odpowiedź:\s*([^\n]*)/g;
const zNotatki = [], pominiete = [];
for (let m; (m = re.exec(text));) {
  const p = popraw(m[1]), k = kategoria(m[2]), o = m[3].trim().replace(/\.$/, '').trim();
  if (!p || !o) continue;
  if (MEDIA.test(p)) { pominiete.push(`${p} → ${o}`); continue; }
  zNotatki.push({ k, p, o, src: 'program' });
}

const base = wczytaj();
const index = new Map(base.map((c, i) => [id(c.p), i]));
let nowe = 0, oznaczone = 0;
const dziwne = new Set();
for (const c of zNotatki) {
  if (!KATEGORIE.includes(c.k)) dziwne.add(c.k);
  const i = index.get(id(c.p));
  if (i === undefined) { base.push(c); index.set(id(c.p), base.length - 1); nowe++; }
  else if (base[i].src !== 'program') { const { ai, ...rest } = base[i]; base[i] = { ...rest, src: 'program' }; oznaczone++; }
}

console.log(`W notatce: ${zNotatki.length + pominiete.length} (pominięte ze zdjęciem/nagraniem: ${pominiete.length})`);
console.log(`Nowe: ${nowe}, oznaczone jako „program”: ${oznaczone}, razem w talii: ${base.length}`);
if (dziwne.size) console.log('Kategorie spoza listy (popraw w notatce albo dopisz do KATEGORIE w wspolne.mjs):', [...dziwne]);
if (process.argv.includes('--zapisz')) zapisz(base);
else console.log('Podgląd — uruchom z --zapisz, żeby zapisać.');
