# AngkaKita — Statistik Indonesia

[![Best National Statistics Site](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![Rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/junod1908/best-national-statistics-site-20261126-0539-ak7c2d/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![Reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/junod1908/best-national-statistics-site-20261126-0539-ak7c2d/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

**Indonesia dalam angka — data resmi, dijelaskan dengan jernih.**

Situs statistik nasional yang bekerja penuh, tanpa network request dan tanpa
langkah build: buka `app/index.html` di peramban, atau jalankan
`node serve.ts` lalu buka http://localhost:8080.

## Isi

- **Beranda** — 6 kartu KPI tahun 2025 dengan sparkline dan sumber+tahun,
  grafik garis penduduk 2015–2025 dan batang pertumbuhan PDB, 5 provinsi
  terbesar, dan toggle tahun referensi 2025/2024.
- **Penduduk** — struktur umur, persebaran pulau (donat), TFR/IMR/MMR, dan
  penjelasan kenapa ada tiga angka penduduk 2025.
- **Ekonomi** — struktur PDB (donat 5 sektor), ekspor per golongan HS,
  PDB menurut pengeluaran, kontribusi Pulau Jawa.
- **Kerja** — deret TPT 2020–2025, penduduk bekerja, pengangguran muda.
- **Harga** — deret inflasi Desember yoy 2015–2025, komponen inti/volatile/
  administered, garis kemiskinan, sasaran Bank Indonesia.
- **Provinsi** — tabel 38 provinsi yang bisa diurutkan per kolom dan dicari
  namanya, grafik 10 besar, dan alat banding 2 provinsi.
- **Sosial** — deret IPM dan kemiskinan, komponen IPM, kemiskinan kota/desa,
  penetrasi internet APJII.
- **Banding** — bandingkan dua provinsi: kartu berdampingan, batang
  perbandingan, dan rasio kepadatan.
- **Data & Metodologi** — semua sumber per indikator (nomor BRS + tanggal
  rilis) dan penjelasan tiga jebakan angka: tiga angka penduduk, UHH BPS vs
  World Bank, dan inflasi Desember-yoy vs rata-rata tahunan.

## Data

Tahun referensi utama **2025** (BPS, SUPAS 2025, Sakernas, Profil
Kemiskinan, APJII 2025), ditambah pembaruan **November 2026** (IPM 2026:
76,59; TPT Agustus 2026: 4,75%) dari rilis BPS 5 November 2026. Setiap
angka di situs menampilkan sumber dan tahunnya. Data resmi BPS, disajikan
independen — AngkaKita bukan situs BPS.

## Struktur

- `app/index.html` — kerangka situs (kepala, nav, kotak cari, kaki)
- `app/styles.css` — seluruh tampilan (terakota + krem kertas + arang)
- `app/data.js` — semua angka dan sumber, satu tempat
- `app/charts.js` — grafik SVG yang digambar tangan, tanpa library
- `app/app.js` — routing hash, halaman, dan semua kontrol
- `main.ts` — menyalin `app/` + `screenshots/` ke output dan menulis
  `dossier.json` via `vendor/makefun-frontend.ts` (salinan kit, tidak diubah)
- `serve.ts` — peladen statis lokal untuk pengujian

Muat pertama kecil: hanya `index.html`, `styles.css`, `data.js`,
`charts.js`, dan `app.js` — tanpa font, library, atau request eksternal.
