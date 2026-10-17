// Analiza odpowiedzi drużyny → notatki w bazie wiedzy (folder Analizy/): jedna na osobę + „Drużyna”.
//   node narzedzia/analiza.mjs                 → dane z Firebase (awantura/odpowiedzi)
//   node narzedzia/analiza.mjs --plik dane.json → dane z pliku ({ osoba: { id: odpowiedź } }, do testów)
//   node narzedzia/analiza.mjs --katalog <sejf> → inny sejf niż domyślna „Baza wiedzy”
// Odpowiedź: { q: id pytania, k: kategoria, s: źródło, ok: 0/1, h: podpowiedź 0/1, ms, t, m: tryb }
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ZRODLA, id, wczytaj } from './wspolne.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const OUT = join(arg('--katalog') || 'C:\\Users\\gaace\\ProjectsVault\\Personal\\Awantura o Kasę\\Baza wiedzy', 'Analizy');
const ANS = 'https://plan-dyzurow-default-rtdb.europe-west1.firebasedatabase.app/awantura/odpowiedzi.json';

let data;
if (arg('--plik')) data = JSON.parse(readFileSync(arg('--plik'), 'utf8').replace(/^\uFEFF/, ''));
else {
  const r = await fetch(ANS);
  if (!r.ok) { console.error(`Baza odpowiedziała ${r.status} — sprawdź reguły Firebase dla awantura/odpowiedzi.`); process.exit(1); }
  data = (await r.json()) || {};
}

const cards = new Map(wczytaj().map(c => [id(c.p), c]));
const wiki = t => 'https://pl.wikipedia.org/wiki/' + encodeURIComponent(t.replace(/ /g, '_'));
const pct = x => Math.round(x * 100) + '%';
const pts = a => a.ok ? (a.h ? 0.5 : 1) : 0;          // jak w appce: bez podpowiedzi 1, z podpowiedzią ½, źle 0
const kat = k => `[[Kategorie/${k}|${k}]]`;
const today = new Date().toISOString().slice(0, 10);
const WEEK = 7 * 24 * 3600 * 1000;

function stats(list) {
  const cat = {};
  for (const a of list) {
    const m = cat[a.k] || (cat[a.k] = { k: a.k, n: 0, score: 0, hint: 0, bad: 0 });
    m.n++; m.score += pts(a); m.hint += a.h ? 1 : 0; m.bad += a.ok ? 0 : 1;
  }
  const cats = Object.values(cat).map(c => ({ ...c, v: c.score / c.n })).sort((a, b) => b.v - a.v);
  return { n: list.length, v: list.reduce((s, a) => s + pts(a), 0) / (list.length || 1), hint: list.filter(a => a.h).length / (list.length || 1), cats };
}

const people = Object.entries(data).map(([name, obj]) => ({ name, list: Object.values(obj || {}).filter(a => a && a.q) })).filter(p => p.list.length);
if (!people.length) { console.log('Brak odpowiedzi w bazie — nie ma czego analizować.'); process.exit(0); }
mkdirSync(OUT, { recursive: true });

for (const p of people) {
  const s = stats(p.list);
  const minN = s.cats.filter(c => c.n >= 5).length >= 4 ? 5 : 3;
  const rated = s.cats.filter(c => c.n >= minN);
  const strong = rated.slice(0, 3), weak = rated.slice(-3).reverse().filter(c => !strong.includes(c));
  const recent = p.list.filter(a => a.t > Date.now() - WEEK), older = p.list.filter(a => a.t <= Date.now() - WEEK);
  const trend = recent.length >= 10 && older.length >= 10 ? stats(recent).v - stats(older).v : null;

  // Pytania-zmory: najczęściej błędne lub ratowane podpowiedzią
  const perQ = new Map();
  for (const a of p.list) {
    const x = perQ.get(a.q) || { q: a.q, n: 0, bad: 0, hint: 0 };
    x.n++; x.bad += a.ok ? 0 : 1; x.hint += a.ok && a.h ? 1 : 0; perQ.set(a.q, x);
  }
  const trouble = [...perQ.values()].filter(x => x.bad || x.hint).map(x => ({ ...x, w: x.bad + x.hint / 2, c: cards.get(x.q) }))
    .filter(x => x.c).sort((a, b) => b.w - a.w).slice(0, 15);
  const topics = new Map();
  for (const x of trouble) for (const t of x.c.tm || []) { const y = topics.get(t) || { t, k: x.c.k, w: 0 }; y.w += x.w; topics.set(t, y); }
  const read = [...topics.values()].sort((a, b) => b.w - a.w).slice(0, 12);
  const untouched = [...new Set([...cards.values()].map(c => c.k))].filter(k => !s.cats.some(c => c.k === k));

  writeFileSync(join(OUT, `${p.name}.md`), `---
osoba: ${p.name}
odpowiedzi: ${s.n}
skutecznosc: ${Math.round(s.v * 100)}
podpowiedzi: ${Math.round(s.hint * 100)}
zaktualizowano: ${today}
tags: [awantura, analiza]
---
# Analiza: ${p.name}

> [!info] Generowane ${today} z odpowiedzi w appce. Skuteczność: dobrze bez podpowiedzi = 1, z podpowiedzią = ½, źle = 0.

**Odpowiedzi:** ${s.n} · **skuteczność:** ${pct(s.v)} · **z podpowiedzią:** ${pct(s.hint)}${trend !== null ? ` · **ostatni tydzień:** ${trend >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(trend * 100))} pkt proc.` : ''}

## Mocne strony
${strong.length ? strong.map(c => `- ${kat(c.k)} — ${pct(c.v)} (${c.n} odp.)`).join('\n') : `_Za mało danych — potrzeba po ${minN} odpowiedzi w kategorii._`}

## Do podciągnięcia
${weak.length ? weak.map(c => `- ${kat(c.k)} — ${pct(c.v)} (${c.n} odp.)${c.hint / c.n >= 0.3 ? ', często z podpowiedzią' : ''}`).join('\n') : '_Brak wyraźnie słabych kategorii._'}
${untouched.length ? `\n**Jeszcze nie ćwiczone:** ${untouched.map(kat).join(', ')}\n` : ''}
## Co poczytać
Tematy z pytań, które sprawiły kłopot (od najważniejszych):

${read.length ? read.map(x => `- [${x.t}](${wiki(x.t)}) · ${kat(x.k)}`).join('\n') : '_Na razie nic — wszystko idzie dobrze._'}

## Pytania-zmory
${trouble.length ? trouble.map(x => `- **${x.c.p}** → ${x.c.o} _(${kat(x.c.k)}; źle ${x.bad}×${x.hint ? `, z podpowiedzią ${x.hint}×` : ''})_`).join('\n') : '_Brak._'}

## Wszystkie kategorie
| Kategoria | Odp. | Skuteczność | Z podpowiedzią |
|---|---|---|---|
${s.cats.map(c => `| ${kat(c.k).replace('|', '\\|')} | ${c.n} | ${pct(c.v)} | ${pct(c.hint / c.n)} |`).join('\n')}
`, 'utf8');
}

// Drużyna: kto w czym najlepszy (do licytacji) + wspólne luki
const all = people.map(p => ({ ...p, s: stats(p.list) }));
const cats = [...new Set(all.flatMap(p => p.s.cats.map(c => c.k)))].sort((a, b) => a.localeCompare(b, 'pl'));
const table = cats.map(k => {
  const r = all.map(p => ({ name: p.name, c: p.s.cats.find(c => c.k === k) })).filter(x => x.c && x.c.n >= 3).sort((a, b) => b.c.v - a.c.v);
  const team = stats(all.flatMap(p => p.list.filter(a => a.k === k)));
  return { k, r, team: team.v, n: team.n };
});
const strongT = table.filter(t => t.n >= 6).sort((a, b) => b.team - a.team);
writeFileSync(join(OUT, 'Drużyna.md'), `---
zaktualizowano: ${today}
tags: [awantura, analiza]
---
# Analiza drużyny

| Osoba | Odp. | Skuteczność | Z podpowiedzią |
|---|---|---|---|
${all.sort((a, b) => b.s.v - a.s.v).map(p => `| [[Analizy/${p.name}\\|${p.name}]] | ${p.s.n} | ${pct(p.s.v)} | ${pct(p.s.hint)} |`).join('\n')}

## Licytacja: na co iść wysoko
${strongT.slice(0, 5).map(t => `- ${kat(t.k)} — drużyna ${pct(t.team)}${t.r[0] ? `, odpowiada **${t.r[0].name}** (${pct(t.r[0].c.v)})` : ''}`).join('\n') || '_Za mało danych._'}

## Licytacja: tu ostrożnie (i tu się uczyć)
${strongT.slice(-5).reverse().map(t => `- ${kat(t.k)} — drużyna ${pct(t.team)}`).join('\n') || '_Za mało danych._'}

## Kto w czym najmocniejszy
Liczone od 3 odpowiedzi w kategorii.

| Kategoria | Najlepiej | Drugi | Drużyna |
|---|---|---|---|
${table.map(t => `| ${kat(t.k).replace('|', '\\|')} | ${t.r[0] ? `${t.r[0].name} ${pct(t.r[0].c.v)}` : '—'} | ${t.r[1] ? `${t.r[1].name} ${pct(t.r[1].c.v)}` : '—'} | ${pct(t.team)} (${t.n}) |`).join('\n')}

Źródła pytań w statystykach: ${Object.values(ZRODLA).join(', ')}.
`, 'utf8');
console.log(`Analizy zapisane w: ${OUT}\n  osoby: ${people.map(p => `${p.name} (${p.list.length})`).join(', ')}`);
