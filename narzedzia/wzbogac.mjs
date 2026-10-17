// Uzupełnia pytania o podpowiedź (h), wyjaśnienie (w) i tematy pokrewne (tm = tytuły artykułów polskiej Wikipedii).
//   node narzedzia/wzbogac.mjs --stan                  → ile pytań czego nie ma
//   node narzedzia/wzbogac.mjs --eksport [N]           → wypisuje N (domyślnie 60) pytań do uzupełnienia jako JSON
//   node narzedzia/wzbogac.mjs <plik.json> [--sprawdz] → waliduje i scala uzupełnienia (z --sprawdz tylko waliduje)
//   node narzedzia/wzbogac.mjs --wiki                  → sprawdza tytuły tm w Wikipedii: poprawia przekierowania, usuwa nieistniejące
// Format pliku: [{ "id": "q…", "h": ["A","B","C","D"], "w": "Wyjaśnienie.", "tm": ["Tytuł artykułu"] }, …]
//   h  — wymagane, jeśli pytanie go nie ma (odpowiedź musi być jednym z 4 wariantów); istniejącego h nie nadpisuje
//   w  — 1–3 zdania: dlaczego tak / obliczenie / kontekst; puste "" = świadomie bez wyjaśnienia
//   tm — 1–3 tytuły artykułów z pl.wikipedia.org (do nauki i bazy wiedzy)
import { readFileSync } from 'node:fs';
import { id, wczytaj, zapisz } from './wspolne.mjs';

const base = wczytaj();
const byId = new Map(base.map(c => [id(c.p), c]));
const [arg, flag] = process.argv.slice(2);
const brak = c => !c.h || c.w === undefined || !c.tm;

if (arg === '--stan') {
  console.log(`Pytań: ${base.length} | bez podpowiedzi: ${base.filter(c => !c.h).length} | bez wyjaśnienia: ${base.filter(c => c.w === undefined).length} | bez tematów: ${base.filter(c => !c.tm).length} | do uzupełnienia: ${base.filter(brak).length}`);
  process.exit(0);
}
if (arg === '--eksport') {
  const n = +flag || 60;
  const list = base.filter(brak).slice(0, n).map(c => ({ id: id(c.p), k: c.k, p: c.p, o: c.o, ...(c.h ? { h: c.h } : {}) }));
  console.log(JSON.stringify(list, null, 0).replace(/\},\{/g, '},\n{'));
  console.error(`[${list.length} z ${base.filter(brak).length} do uzupełnienia]`);
  process.exit(0);
}
if (arg === '--wiki') {
  const titles = [...new Set(base.flatMap(c => c.tm || []))];
  const fix = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const chunk = titles.slice(i, i + 50);
    const url = 'https://pl.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=' + encodeURIComponent(chunk.join('|'));
    const r = await (await fetch(url, { headers: { 'User-Agent': 'AwanturaFiszki/1.0 (prywatne narzędzie do nauki)' } })).json();
    const norm = new Map((r.query.normalized || []).map(x => [x.from, x.to]));
    const redir = new Map((r.query.redirects || []).map(x => [x.from, x.to]));
    const pages = Object.values(r.query.pages);
    for (const t of chunk) {
      let cur = norm.get(t) || t;
      cur = redir.get(cur) || cur;
      const page = pages.find(p => p.title === cur);
      fix.set(t, page && !('missing' in page) && !('invalid' in page) ? cur : null);
    }
  }
  let zmienione = 0, usuniete = [];
  for (const c of base) {
    if (!c.tm) continue;
    const next = [...new Set(c.tm.map(t => fix.get(t)).filter(Boolean))];
    usuniete.push(...c.tm.filter(t => !fix.get(t)));
    if (JSON.stringify(next) !== JSON.stringify(c.tm)) { c.tm = next; zmienione++; }
  }
  zapisz(base);
  console.log(`Tytułów: ${titles.length}, przekierowań poprawionych/usuniętych w ${zmienione} pytaniach.`);
  if (usuniete.length) console.log('Nie ma takich artykułów (usunięte):\n  ' + [...new Set(usuniete)].join('\n  '));
  process.exit(0);
}
if (!arg) { console.error('Podaj plik albo --stan / --eksport / --wiki.'); process.exit(1); }

const patch = JSON.parse(readFileSync(arg, 'utf8').replace(/^﻿/, ''));
const errors = [];
let ok = 0;
const changes = [];
for (const [i, x] of patch.entries()) {
  const c = byId.get(x.id);
  const e = [];
  if (!c) { errors.push(`#${i + 1} ${x.id}: nie ma takiego pytania`); continue; }
  const h = c.h || x.h;
  if (!c.h) {
    if (!Array.isArray(x.h) || x.h.length !== 4 || new Set(x.h.map(s => String(s).trim().toLowerCase())).size !== 4) e.push('h musi mieć 4 różne warianty');
    else if (!x.h.some(s => String(s).trim().toLowerCase() === c.o.trim().toLowerCase())) e.push(`odpowiedź „${c.o}” nie jest jednym z wariantów h`);
  }
  if (x.w !== undefined && (typeof x.w !== 'string' || x.w.length > 500)) e.push('w: tekst do 500 znaków');
  if (x.tm !== undefined && (!Array.isArray(x.tm) || x.tm.length > 3 || x.tm.some(t => typeof t !== 'string' || !t.trim()))) e.push('tm: 0–3 tytuły');
  if (e.length) { errors.push(`#${i + 1} ${c.p.slice(0, 70)}\n     ✗ ${e.join('; ')}`); continue; }
  changes.push([c, { h: h.map(s => String(s).trim()), w: x.w !== undefined ? x.w.trim() : c.w, tm: x.tm !== undefined ? x.tm.map(t => t.trim()) : c.tm }]);
  ok++;
}
if (errors.length) console.log(`Odrzucone (${errors.length}):\n  ` + errors.join('\n  '));
if (flag === '--sprawdz' || errors.length) { console.log(`\nPoprawnych: ${ok}/${patch.length}${errors.length ? ' — nic nie zapisano' : ' (podgląd)'}.`); process.exit(errors.length ? 2 : 0); }
for (const [c, v] of changes) { c.h = v.h; if (v.w !== undefined) c.w = v.w; if (v.tm !== undefined) c.tm = v.tm; }
zapisz(base);
console.log(`Uzupełniono ${ok} pytań. Zostało do uzupełnienia: ${base.filter(brak).length}.`);
