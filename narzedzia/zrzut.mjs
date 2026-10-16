// Zrzuca pytania ze wspólnej bazy (Firebase) do pytania.json — dopisuje tylko te, których jeszcze tam nie ma.
// Użycie:  node narzedzia/zrzut.mjs   → potem commit + push pytania.json
// Pytania zostają też w bazie; appka i tak pomija duplikaty (po treści pytania).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DB = 'https://plan-dyzurow-default-rtdb.europe-west1.firebasedatabase.app/awantura/pytania.json';
const FILE = fileURLToPath(new URL('../pytania.json', import.meta.url));

// Ten sam hash co w index.html
const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)) | 0; return 'q' + (h >>> 0).toString(36); };
const id = c => hash(String(c.p).trim().toLowerCase());

const res = await fetch(DB);
if (!res.ok) { console.error(`Baza odpowiedziała ${res.status} — sprawdź reguły Firebase.`); process.exit(1); }
const shared = Object.values((await res.json()) || {}).sort((a, b) => (a.t || 0) - (b.t || 0));

const base = JSON.parse(readFileSync(FILE, 'utf8'));
const known = new Set(base.map(id));
const fresh = shared.filter(c => c.p && c.o && !known.has(id(c)))
  .map(({ k, p, o, h, z, a }) => Object.fromEntries(Object.entries({ k: k || 'Inne', p, o, h, z, a }).filter(([, v]) => v)));

if (!fresh.length) { console.log(`Nic nowego (w bazie: ${shared.length}, w pytania.json: ${base.length}).`); process.exit(0); }
const all = [...base, ...fresh];
writeFileSync(FILE, '[\n' + all.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n');
console.log(`Dopisano ${fresh.length} pytań → pytania.json ma teraz ${all.length}.`);
