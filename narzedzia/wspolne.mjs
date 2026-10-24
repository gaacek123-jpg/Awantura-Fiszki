// Wspólne dla skryptów w narzedzia/: kategorie programu, id pytania, odczyt/zapis pytania.json.
// Kategorie i id pochodzą z ../walidacja.js — tego samego modułu używa appka.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export { KATEGORIE, id } from '../walidacja.js';

export const FILE = fileURLToPath(new URL('../pytania.json', import.meta.url));

// Źródło pytania: program = spisane z odcinków, ai = wygenerowane, user = dodane przez drużynę w appce
export const ZRODLA = { program: 'z programu', ai: 'AI', user: 'od drużyny' };

export const wczytaj = () => JSON.parse(readFileSync(FILE, 'utf8'));
export const zapisz = list => writeFileSync(FILE, '[\n' + list.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n');
