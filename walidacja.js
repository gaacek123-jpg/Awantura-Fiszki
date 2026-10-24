// Wspólne reguły dla nowych pytań — używa ich appka (generator z AI w przeglądarce) i narzedzia/dodaj.mjs.
// Czysty moduł ES bez zależności, działa w przeglądarce i w Node.

export const KATEGORIE = ['Anatomia i medycyna', 'Astronomia', 'Biologia', 'Chemia', 'Czasy współczesne', 'Film', 'Filozofia i religie',
  'Fizyka', 'Geografia', 'Historia', 'Język polski', 'Kulinaria', 'Literatura', 'Matematyka', 'Motoryzacja', 'Muzyka klasyczna',
  'Muzyka rozrywkowa', 'Piłka nożna', 'Polityka i gospodarka', 'Popkultura', 'Przysłowia i cytaty', 'Rozmaitości', 'Seriale',
  'Sport', 'Sztuka', 'Technologie', 'Wędkarstwo'];

// Ten sam hash co w index.html — duplikat = ta sama treść pytania
const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)) | 0; return 'q' + (h >>> 0).toString(36); };
export const id = p => hash(String(p).trim().toLowerCase());
export const plain = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, ' ').trim();

// Sprawdza listę nowych pytań względem istniejących.
// Zwraca { ok: [pytania gotowe do dopisania], errors: [{ nr, p, powody }], warnings: [tekst] }.
export function sprawdzPytania(nowe, istniejace) {
  const known = new Set(istniejace.map(c => id(c.p)));
  const answers = new Map(istniejace.map(c => [plain(c.o), c.p]));
  const ok = [], errors = [], warnings = [];
  for (const [i, raw] of (Array.isArray(nowe) ? nowe : []).entries()) {
    const nr = i + 1;
    const c = {
      k: String(raw?.k || '').trim(), p: String(raw?.p || '').trim(), o: String(raw?.o || '').trim(),
      h: Array.isArray(raw?.h) ? raw.h.map(x => String(x).trim()) : null,
      w: String(raw?.w || '').trim(), tm: Array.isArray(raw?.tm) ? raw.tm.map(x => String(x).trim()).filter(Boolean) : [],
    };
    const powody = [];
    if (!KATEGORIE.includes(c.k)) powody.push(`nieznana kategoria „${c.k}”`);
    if (!c.p.endsWith('?')) powody.push('pytanie nie kończy się „?”');
    if (c.p.length < 15 || c.p.length > 400) powody.push('pytanie za krótkie albo za długie');
    if (!c.o || c.o.length > 120) powody.push('brak odpowiedzi albo za długa');
    if (!c.h || c.h.length !== 4 || new Set(c.h.map(plain)).size !== 4) powody.push('podpowiedź musi mieć 4 różne warianty');
    else if (!c.h.some(h => h.toLowerCase() === c.o.toLowerCase())) powody.push('odpowiedź nie jest jednym z wariantów podpowiedzi');
    if (!c.w || c.w.length > 500) powody.push('wyjaśnienie: 1–3 zdania, do 500 znaków');
    if (!c.tm.length || c.tm.length > 3) powody.push('tematy: 1–3 tytuły artykułów z polskiej Wikipedii');
    if (known.has(id(c.p))) powody.push('takie pytanie już jest');
    if (powody.length) { errors.push({ nr, p: c.p || '(puste)', powody }); continue; }
    if (answers.has(plain(c.o))) warnings.push(`#${nr} ta sama odpowiedź „${c.o}” co w: ${answers.get(plain(c.o))}`);
    known.add(id(c.p));
    ok.push(c);
  }
  return { ok, errors, warnings };
}

// Wyciąga tablicę JSON z odpowiedzi czatu AI (toleruje ```json … ```, tekst przed i po, pojedynczy obiekt)
export function wyciagnijJson(tekst) {
  const t = String(tekst).replace(/^﻿/, '');
  const blok = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const src = blok ? blok[1] : t;
  const start = src.search(/[\[{]/), end = Math.max(src.lastIndexOf(']'), src.lastIndexOf('}'));
  if (start < 0 || end < start) throw new Error('Nie znalazłem JSON-a w tekście.');
  // Czaty AI lubią zostawić przecinek przed ] albo } — JSON.parse by się na tym wyłożył
  const data = JSON.parse(src.slice(start, end + 1).replace(/,\s*([\]}])/g, '$1'));
  return Array.isArray(data) ? data : (Array.isArray(data.pytania) ? data.pytania : [data]);
}
