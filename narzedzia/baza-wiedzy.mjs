// Generuje bazę wiedzy (osobny sejf Obsidiana) z pytania.json: notatka startowa + notatka na kategorię
// z tematami do poczytania (Wikipedia) i zwijanymi kartami pytań do samosprawdzenia.
//   node narzedzia/baza-wiedzy.mjs [katalog]   (domyślnie: sejf „Baza wiedzy” obok notatek o Awanturze)
// Notatki w Kategorie/ i Start.md są nadpisywane przy każdym uruchomieniu; folder Moje/ i Analizy/ zostają nietknięte.
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { KATEGORIE, ZRODLA, wczytaj } from './wspolne.mjs';
import { BAZA_WIEDZY } from './sejf.mjs';

const OUT = process.argv[2] || BAZA_WIEDZY;
const wiki = t => 'https://pl.wikipedia.org/wiki/' + encodeURIComponent(t.replace(/ /g, '_'));
const md = s => String(s).replace(/\|/g, '\\|');            // bezpieczne w tabelach
const quote = s => String(s).replace(/\n/g, '\n> ');          // wieloliniowe w calloutach
const today = new Date().toISOString().slice(0, 10);

// Ogólne, sprawdzone źródła do dalszej nauki per kategoria
const ZASOBY = {
  'Literatura': [['Wolne Lektury — teksty lektur za darmo', 'https://wolnelektury.pl/']],
  'Przysłowia i cytaty': [['Wolne Lektury — źródła cytatów', 'https://wolnelektury.pl/']],
  'Język polski': [['Poradnia językowa PWN', 'https://sjp.pwn.pl/poradnia'], ['Słownik języka polskiego PWN', 'https://sjp.pwn.pl/']],
  'Matematyka': [['Khan Academy po polsku', 'https://pl.khanacademy.org/']],
  'Fizyka': [['Khan Academy po polsku', 'https://pl.khanacademy.org/']],
  'Chemia': [['Khan Academy po polsku', 'https://pl.khanacademy.org/']],
  'Biologia': [['Khan Academy po polsku', 'https://pl.khanacademy.org/']],
  'Astronomia': [['Khan Academy po polsku', 'https://pl.khanacademy.org/']],
  'Historia': [['Polona — cyfrowa biblioteka narodowa', 'https://polona.pl/']],
  'Sztuka': [['Culture.pl — polska kultura i artyści', 'https://culture.pl/pl'], ['Polona — cyfrowa biblioteka narodowa', 'https://polona.pl/']],
  'Muzyka klasyczna': [['Culture.pl — kompozytorzy', 'https://culture.pl/pl'], ['Narodowy Instytut Fryderyka Chopina', 'https://nifc.pl/']],
  'Muzyka rozrywkowa': [['Culture.pl — muzyka', 'https://culture.pl/pl']],
  'Film': [['Filmweb', 'https://www.filmweb.pl/'], ['Culture.pl — film', 'https://culture.pl/pl']],
  'Seriale': [['Filmweb', 'https://www.filmweb.pl/']],
  'Piłka nożna': [['90minut.pl — historia polskiej piłki', 'http://www.90minut.pl/']],
  'Anatomia i medycyna': [['Medycyna Praktyczna dla pacjentów', 'https://www.mp.pl/pacjent/']],
};

const base = wczytaj();
const byCat = new Map(KATEGORIE.map(k => [k, []]));
for (const c of base) (byCat.get(c.k) || byCat.set(c.k, []).get(c.k)).push(c);

for (const d of ['', 'Kategorie', 'Moje', 'Analizy', '.obsidian']) mkdirSync(join(OUT, d), { recursive: true });
const write = (rel, text) => writeFileSync(join(OUT, rel), text.replace(/\n{3,}/g, '\n\n'), 'utf8');
if (!existsSync(join(OUT, '.obsidian', 'app.json'))) {
  write('.obsidian/app.json', JSON.stringify({ newFileLocation: 'folder', newFileFolderPath: 'Moje', alwaysUpdateLinks: true }, null, 2));
}
if (!existsSync(join(OUT, 'Moje', 'O tym folderze.md'))) {
  write('Moje/O tym folderze.md', '# Moje notatki\n\nTu pisz własne notatki — generator ich nie rusza. Linkuj do kategorii, np. [[Kategorie/Historia|Historia]].\n');
}
// Kategorie, które zniknęły z talii, usuwamy, żeby nie zostawały martwe notatki
for (const f of readdirSync(join(OUT, 'Kategorie'))) if (f.endsWith('.md') && !byCat.has(f.slice(0, -3))) unlinkSync(join(OUT, 'Kategorie', f));

const rows = [];
for (const [k, list] of byCat) {
  if (!list.length) continue;
  const topics = new Map();
  for (const c of list) for (const t of c.tm || []) (topics.get(t) || topics.set(t, []).get(t)).push(c);
  const sorted = [...topics.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'pl'));
  const ile = s => list.filter(c => c.src === s).length;
  rows.push(`| [[Kategorie/${k}\\|${md(k)}]] | ${list.length} | ${ile('program')} | ${sorted.length} |`);

  const cards = [...list].sort((a, b) => (a.src === 'program' ? 0 : 1) - (b.src === 'program' ? 0 : 1)).map(c =>
    `> [!question]- ${c.p.replace(/\n/g, ' ')} · *${ZRODLA[c.src] || c.src}*\n` +
    `> **Odpowiedź:** ${quote(c.o)}` +
    (c.w ? `\n>\n> ${quote(c.w)}` : '') +
    ((c.tm || []).length ? `\n>\n> 📖 ${c.tm.map(t => `[${t}](${wiki(t)})`).join(' · ')}` : '')).join('\n\n');

  write(`Kategorie/${k}.md`, `---
kategoria: ${k}
pytan: ${list.length}
z_programu: ${ile('program')}
tematow: ${sorted.length}
zaktualizowano: ${today}
tags: [awantura, baza-wiedzy]
---
# ${k}

> [!info] Generowane z talii fiszek (${today}). Ręczne zmiany w tej notatce znikną przy kolejnym generowaniu — swoje notatki pisz w folderze [[Moje/O tym folderze|Moje]].

**Pytań:** ${list.length} (z programu: ${ile('program')}, AI: ${ile('ai')}, od drużyny: ${ile('user')})

## Tematy do poczytania
Od najczęściej powracających w pytaniach:

${sorted.map(([t, qs]) => `- [${t}](${wiki(t)})${qs.length > 1 ? ` — ${qs.length} pytania` : ''}`).join('\n')}
${ZASOBY[k] ? `\n## Gdzie szukać dalej\n\n${ZASOBY[k].map(([n, u]) => `- [${n}](${u})`).join('\n')}\n- [Wikipedia — wyszukiwarka](https://pl.wikipedia.org/)\n` : ''}
## Pytania do samosprawdzenia
Kliknij pytanie, żeby zobaczyć odpowiedź. Najpierw pytania z programu.

${cards}
`);
}

write('Start.md', `---
tags: [awantura, baza-wiedzy]
zaktualizowano: ${today}
---
# Baza wiedzy — Awantura o kasę

Wiedza zebrana z pytań do fiszek drużyny: każda kategoria programu ma notatkę z **tematami do poczytania** (linki do Wikipedii, uporządkowane według tego, jak często wracają w pytaniach) i **zwijanymi kartami pytań** do samosprawdzenia.

- Analizy mocnych i słabych stron każdej osoby: folder [[Analizy]] (tworzy je \`node narzedzia/analiza.mjs\`).
- Własne notatki: folder [[Moje/O tym folderze|Moje]] — generator ich nie nadpisuje.
- Appka z fiszkami: https://gaacek123-jpg.github.io/Awantura-Fiszki/

| Kategoria | Pytań | Z programu | Tematów |
|---|---|---|---|
${rows.join('\n')}

Razem: ${base.length} pytań, ${new Set(base.flatMap(c => c.tm || [])).size} tematów.

*Odświeżanie: \`node C:\\Users\\gaace\\Opus Vitae - Black\\Repos\\AwanturaPrep\\narzedzia\\baza-wiedzy.mjs\`*
`);
console.log(`Baza wiedzy: ${OUT}\n  ${rows.length} notatek kategorii, ${base.length} pytań.`);
