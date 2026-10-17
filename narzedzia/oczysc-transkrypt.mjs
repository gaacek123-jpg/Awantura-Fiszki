// Czyści transkrypt odcinka do zwykłego tekstu: usuwa znaczniki czasu, numery napisów, tagi i powtórzone linie.
// Obsługuje: kopię z YouTube („Pokaż transkrypcję”), .srt, .vtt, wynik Whispera, zwykły tekst.
//   node narzedzia/oczysc-transkrypt.mjs <plik>   → wypisuje czysty tekst (akapity co ~10 linii)
import { readFileSync } from 'node:fs';

const plik = process.argv[2];
if (!plik) { console.error('Podaj plik transkryptu.'); process.exit(1); }

const TIME = /^\[?\(?\d{1,2}:\d{2}(:\d{2})?([.,]\d+)?\)?\]?$/;                       // 0:12, 01:02:03, [00:12.500]
const RANGE = /^\[?\d{1,2}:\d{2}(:\d{2})?([.,]\d+)?\s*-->\s*\d{1,2}:\d{2}(:\d{2})?([.,]\d+)?.*$/; // srt/vtt/whisper
const lines = readFileSync(plik, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
const out = [];
for (let raw of lines) {
  let l = raw.replace(/<[^>]+>/g, '').replace(/^\[[\d:.,\s>-]+\]\s*/, '').replace(/^\d{1,2}:\d{2}(:\d{2})?\s+/, '').trim();
  if (!l || l === 'WEBVTT' || /^(Kind|Language|NOTE)\b/.test(l) || /^\d+$/.test(l) || TIME.test(l) || RANGE.test(l)) continue;
  if (/^\[(muzyka|oklaski|śmiech|music|applause|laughter)\]$/i.test(l)) continue;
  if (out.length && out[out.length - 1] === l) continue;                         // napisy „rolowane” powtarzają linie
  out.push(l);
}
const akapity = [];
for (let i = 0; i < out.length; i += 10) akapity.push(out.slice(i, i + 10).join(' '));
console.log(akapity.join('\n\n'));
console.error(`\n[${lines.length} linii wejścia → ${out.length} linii tekstu, ${akapity.join(' ').split(/\s+/).length} słów]`);
