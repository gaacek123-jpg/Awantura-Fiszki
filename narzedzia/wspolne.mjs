// Wspólne dla skryptów w narzedzia/: kategorie programu, id pytania, odczyt/zapis pytania.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const FILE = fileURLToPath(new URL('../pytania.json', import.meta.url));

export const KATEGORIE = ['Anatomia i medycyna', 'Astronomia', 'Biologia', 'Chemia', 'Czasy współczesne', 'Film', 'Filozofia i religie',
  'Fizyka', 'Geografia', 'Historia', 'Język polski', 'Kulinaria', 'Literatura', 'Matematyka', 'Motoryzacja', 'Muzyka klasyczna',
  'Muzyka rozrywkowa', 'Piłka nożna', 'Polityka i gospodarka', 'Popkultura', 'Przysłowia i cytaty', 'Rozmaitości', 'Seriale',
  'Sport', 'Sztuka', 'Technologie', 'Wędkarstwo'];

// Źródło pytania: program = spisane z odcinków, ai = wygenerowane, user = dodane przez drużynę w appce
export const ZRODLA = { program: 'z programu', ai: 'AI', user: 'od drużyny' };

// Ten sam hash co w index.html — duplikat = ta sama treść pytania
const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)) | 0; return 'q' + (h >>> 0).toString(36); };
export const id = p => hash(String(p).trim().toLowerCase());

export const wczytaj = () => JSON.parse(readFileSync(FILE, 'utf8'));
export const zapisz = list => writeFileSync(FILE, '[\n' + list.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n');
