// Zrzuca pytania ze wspólnej bazy (Firebase) do pytania.json — dopisuje tylko te, których jeszcze tam nie ma.
// Źródło: „ai” dla pytań z panelu „Generuj z AI” w appce, „user” dla dopisanych ręcznie; autor (a) zostaje.
// Pytania bez podpowiedzi/wyjaśnienia/tematów uzupełnisz potem: node narzedzia/wzbogac.mjs --eksport
// Użycie:  node narzedzia/zrzut.mjs   → potem commit + push pytania.json
// Pytania zostają też w bazie; appka i tak pomija duplikaty (po treści pytania).
import { id, wczytaj, zapisz } from './wspolne.mjs';

const DB = 'https://plan-dyzurow-default-rtdb.europe-west1.firebasedatabase.app/awantura';

const res = await fetch(`${DB}/pytania.json`);
if (!res.ok) { console.error(`Baza odpowiedziała ${res.status} — sprawdź reguły Firebase.`); process.exit(1); }
const shared = Object.values((await res.json()) || {}).sort((a, b) => (a.t || 0) - (b.t || 0));

const base = wczytaj();
const known = new Set(base.map(c => id(c.p)));
const fresh = shared.filter(c => c.p && c.o && !known.has(id(c.p)))
  .map(({ k, p, o, h, w, tm, z, a, src }) => Object.fromEntries(Object.entries(
    { k: k || 'Rozmaitości', p, o, h, w, tm, z, a, src: src === 'ai' ? 'ai' : 'user' }).filter(([, v]) => v && (!Array.isArray(v) || v.length))));

if (!fresh.length) console.log(`Nic nowego (w bazie: ${shared.length}, w pytania.json: ${base.length}).`);
else {
  zapisz([...base, ...fresh]);
  console.log(`Dopisano ${fresh.length} pytań → pytania.json ma teraz ${base.length + fresh.length}.`);
}

// Otwarte zgłoszenia błędów — do poprawienia ręcznie w pytania.json, potem „Załatwione” w appce
const rep = await fetch(`${DB}/zgloszenia.json`);
const reports = rep.ok ? Object.values((await rep.json()) || {}) : [];
if (reports.length) {
  console.log(`\nZgłoszone błędy (${reports.length}):`);
  for (const r of reports) console.log(`- [${r.k || ''}] ${r.p}\n    odp.: ${r.o}\n    ⚑ ${r.u}${r.a ? ` (${r.a})` : ''}`);
}
