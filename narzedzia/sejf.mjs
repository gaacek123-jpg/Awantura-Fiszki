// Gdzie w sejfie Opus Vitae leżą notatki Awantury — jedno miejsce dla wszystkich skryptów.
// Zmienna środowiskowa AWANTURA_SEJF nadpisuje ścieżkę (np. do testów).
import { join } from 'node:path';

export const SEJF = process.env.AWANTURA_SEJF || 'C:\\Users\\gaace\\Opus Vitae - Black\\Opus Vitae - Pink\\Projekty\\Awantura o Kasę';
export const NOTATKA_PYTANIA = join(SEJF, 'Awantura - pytania.md');
export const BAZA_WIEDZY = join(SEJF, 'Baza wiedzy');
export const TRANSKRYPTY = join(SEJF, 'Transkrypty');
