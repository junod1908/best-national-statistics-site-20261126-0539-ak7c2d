// AngkaKita — program penyerahan entry (Node 22+, hanya pustaka standar).
//
// Situsnya adalah berkas-berkas statis di app/ (HTML, CSS, dan JavaScript
// polos tanpa langkah build), dan tangkapan layarnya ada di screenshots/.
// Program ini menyerahkan keduanya: menyalin app/ dan screenshots/ dari
// sebelah berkas ini ke direktori keluaran, lalu menulis dossier.json di
// sana dengan pustaka make.fun yang divendor di vendor/makefun-frontend.ts
// (berkas vendor itu dibiarkan apa adanya — pemeriksa membandingkan
// dossier.json dengan hasil pustaka yang sama, byte demi byte).
//
// Di luar kontainer penilai, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Direktori repo ini, dan direktori keluaran (bawaan: /output di penilai).
const repoDir: string = fileURLToPath(new URL('.', import.meta.url));
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn(): void {
  mkdirSync(outDir, { recursive: true });

  // Seluruh situs, apa adanya.
  cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });

  // Tangkapan layar, bila ada — tanpa ini dossier tidak bisa ditulis.
  const shotsDir: string = join(outDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoDir, 'screenshots'))) {
    cpSync(join(repoDir, 'screenshots'), shotsDir, { recursive: true });
  }

  // Ringkasan yang dibaca juri: tangkapan layar, beban muat pertama, sumber.
  // Batas-batas ini mengikuti aturan kompetisi (maksimal 4 tangkapan layar,
  // masing-masing 256 KiB; app/ maksimal 993 berkas dan 16 MiB).
  const dossier: Uint8Array = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
