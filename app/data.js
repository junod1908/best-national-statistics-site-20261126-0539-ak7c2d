// AngkaKita — seluruh angka situs ada di berkas ini, satu tempat.
// Setiap angka membawa sumber + tahunnya. Sumber utama: BPS (SUPAS 2025,
// Sakernas, Profil Kemiskinan, BRS IPM & inflasi), APJII 2025, World Bank WDI.
// Angka 2026 hanya dua: IPM 2026 dan TPT Agustus 2026 (rilis BPS 5 Nov 2026).
// Tidak ada angka yang diambil dari ingatan: deret inflasi, kemiskinan, dan
// ekspor per HS dicek ulang ke BPS/BI sebelum berkas ini ditulis.

const SITE = {
  name: 'AngkaKita',
  tagline: 'Indonesia dalam angka — data resmi, dijelaskan dengan jernih',
  refYear: 2025,
  note: 'Data resmi BPS, disajikan independen. AngkaKita bukan situs BPS.',
};

// Kartu KPI Beranda. value25 = tahun referensi 2025, value24 = 2024 (bila ada).
const KPI = [
  {
    id: 'penduduk', label: 'Jumlah Penduduk', unit: 'juta jiwa',
    value25: '284,67', value24: '281,60', delta: '+1,08% per tahun',
    spark: [255.6, 258.7, 261.9, 265.0, 268.1, 270.2, 272.7, 275.8, 278.7, 281.6, 284.7],
    source: 'BPS, SUPAS 2025', route: '#/penduduk',
  },
  {
    id: 'pdb', label: 'PDB Harga Berlaku', unit: 'Rp triliun',
    value25: '23.821,1', value24: '22.139,0', delta: 'Tumbuh 5,11% (2025)',
    spark: [4.88, 5.03, 5.07, 5.17, 5.02, -2.07, 3.70, 5.31, 5.05, 5.03, 5.11],
    source: 'BPS, rilis 5 Feb 2026', route: '#/ekonomi',
  },
  {
    id: 'kapita', label: 'PDB per Kapita', unit: 'Rp juta / tahun',
    value25: '83,7', value24: null, delta: '± US$5.060 (World Bank)',
    // Mini-tren kartu ini memakai PDB nominal 2024→2025 (Rp22.139,0 T → Rp23.821,1 T):
    // PDB per kapita mengikuti arah PDB nominal, dan deret kapita tahunan tidak dirilis BPS.
    spark: [22139.0, 23821.1],
    source: 'BPS, World Bank 2025', route: '#/ekonomi',
  },
  {
    id: 'inflasi', label: 'Inflasi (Des, yoy)', unit: 'persen',
    value25: '2,92', value24: '1,57', delta: 'IHK 109,92 (2022=100)',
    spark: [3.35, 3.02, 3.61, 3.13, 2.72, 1.68, 1.87, 5.51, 2.61, 1.57, 2.92],
    source: 'BPS, BRS 5 Jan 2026', route: '#/harga',
  },
  {
    id: 'tpt', label: 'Pengangguran Terbuka', unit: '% (Agu)',
    value25: '4,85', value24: '4,91', delta: '7,46 jt menganggur',
    spark: [7.07, 6.49, 5.86, 5.32, 4.91, 4.85],
    source: 'BPS, Sakernas 2025', route: '#/kerja',
  },
  {
    id: 'miskin', label: 'Penduduk Miskin', unit: '% (Sep)',
    value25: '8,25', value24: '8,57', delta: '23,36 jt orang',
    spark: [11.13, 10.70, 10.12, 9.66, 9.22, 10.19, 9.71, 9.57, 9.36, 8.57, 8.25],
    source: 'BPS, Kemiskinan Sep 2025', route: '#/sosial',
  },
];

// Strip pembaruan: hanya angka 2026 yang terverifikasi (rilis BPS 5 Nov 2026).
const UPDATE_2026 = [
  { label: 'IPM 2026', value: '76,59', note: 'naik 0,69 dari 75,90 (2025)' },
  { label: 'Umur harapan hidup 2026', value: '74,68 th', note: 'rilis 5 Nov 2026' },
  { label: 'TPT Agustus 2026', value: '4,75%', note: '7,38 jt penganggur' },
];

const YEARS_POP = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const POP_SERIES = [255.6, 258.7, 261.9, 265.0, 268.1, 270.2, 272.7, 275.8, 278.7, 281.6, 284.7];
const GDP_GROWTH = [4.88, 5.03, 5.07, 5.17, 5.02, -2.07, 3.70, 5.31, 5.05, 5.03, 5.11];
const INFLATION = [3.35, 3.02, 3.61, 3.13, 2.72, 1.68, 1.87, 5.51, 2.61, 1.57, 2.92];
const POVERTY = [11.13, 10.70, 10.12, 9.66, 9.22, 10.19, 9.71, 9.57, 9.36, 8.57, 8.25];
const IPM_YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const IPM_SERIES = [72.81, 73.16, 73.77, 74.39, 75.02, 75.90];
const TPT_YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const TPT_SERIES = [7.07, 6.49, 5.86, 5.32, 4.91, 4.85];
const NET_YEARS = [2022, 2023, 2024, 2025];
const NET_PCT = [77.01, 78.19, 79.50, 80.66];
const NET_USERS = [210.3, 215.6, 221.6, 229.4]; // juta orang, APJII

// Struktur PDB menurut lapangan usaha, 2025 (BPS). "Lainnya" = 100 − jumlah lima sektor.
const SECTORS = [
  { name: 'Industri pengolahan', share: 19.07, note: 'Rp4.541,5 T' },
  { name: 'Perdagangan', share: 13.17, note: 'Rp3.136,6 T' },
  { name: 'Pertanian', share: 13.10, note: 'Rp3.120,5 T' },
  { name: 'Konstruksi', share: 9.83, note: 'Rp2.340,9 T' },
  { name: 'Pertambangan', share: 8.75, note: 'Rp2.084,6 T' },
  { name: 'Lapangan usaha lainnya', share: 36.08, note: 'Sisa 11 lapangan usaha' },
];

// PDB menurut pengeluaran, 2025 (BPS) — pangsa tiap komponen terhadap PDB.
const SPENDING = [
  { name: 'Konsumsi rumah tangga', share: 53.88 },
  { name: 'Pembentukan modal tetap bruto', share: 28.77 },
  { name: 'Ekspor barang dan jasa', share: 22.85 },
];

// Ekspor 2025 menurut golongan HS 2 digit (BPS, US$ miliar). Dicek ulang 27 Nov 2026.
const EXPORTS_HS = [
  { name: 'Bahan bakar mineral (HS 27)', value: 45.1, sub: 'batu bara US$24,5 M' },
  { name: 'Minyak & lemak nabati (HS 15)', value: 34.4, sub: 'CPO + turunan ± US$24,4 M' },
  { name: 'Besi & baja (HS 72)', value: 28.0, sub: 'ferroalloy ± US$16,5 M' },
  { name: 'Mesin & peralatan listrik (HS 85)', value: 19.2, sub: '' },
  { name: 'Kendaraan & suku cadang (HS 87)', value: 12.2, sub: '' },
  { name: 'Permata & logam mulia (HS 71)', value: 11.7, sub: '' },
  { name: 'Nikel & barangnya (HS 75)', value: 9.7, sub: '' },
];

// Persebaran penduduk menurut pulau, SUPAS 2025 (BPS). Juta jiwa hanya yang dirilis.
const ISLANDS = [
  { name: 'Jawa', share: 55.65, pop: '158,41 jt' },
  { name: 'Sumatera', share: 21.89, pop: '62,32 jt' },
  { name: 'Sulawesi', share: 7.40, pop: '21,06 jt' },
  { name: 'Kalimantan', share: 6.23, pop: '17,75 jt' },
  { name: 'Bali–Nusa Tenggara', share: 5.60, pop: '15,95 jt' },
  { name: 'Maluku–Papua', share: 3.22, pop: '—' },
];

// 38 provinsi, penduduk pertengahan 2025 (ribu jiwa), laju tumbuh %, pangsa %,
// kepadatan jiwa/km². Satu sumber: BPS, Proyeksi Penduduk Indonesia 2020–2050
// hasil Sensus Penduduk 2020. Total nasional tabel ini: 284.438,8 ribu jiwa.
const PROVINCES = [
  { name: 'Aceh', island: 'Sumatera', pop: 5626.0, growth: 1.37, share: 1.98, density: 99 },
  { name: 'Sumatera Utara', island: 'Sumatera', pop: 15785.8, growth: 1.37, share: 5.55, density: 218 },
  { name: 'Sumatera Barat', island: 'Sumatera', pop: 5914.3, growth: 1.41, share: 2.08, density: 140 },
  { name: 'Riau', island: 'Sumatera', pop: 6811.2, growth: 1.34, share: 2.39, density: 76 },
  { name: 'Jambi', island: 'Sumatera', pop: 3768.5, growth: 1.28, share: 1.32, density: 77 },
  { name: 'Sumatera Selatan', island: 'Sumatera', pop: 8928.5, growth: 1.12, share: 3.14, density: 103 },
  { name: 'Bengkulu', island: 'Sumatera', pop: 2138.0, growth: 1.30, share: 0.75, density: 106 },
  { name: 'Lampung', island: 'Sumatera', pop: 9522.9, growth: 1.18, share: 3.35, density: 284 },
  { name: 'Kep. Bangka Belitung', island: 'Sumatera', pop: 1550.8, growth: 1.34, share: 0.55, density: 93 },
  { name: 'Kep. Riau', island: 'Sumatera', pop: 2213.5, growth: 1.48, share: 0.78, density: 268 },
  { name: 'DKI Jakarta', island: 'Jawa', pop: 10678.0, growth: 0.23, share: 3.75, density: 16155 },
  { name: 'Jawa Barat', island: 'Jawa', pop: 50759.0, growth: 1.06, share: 17.85, density: 1370 },
  { name: 'Jawa Tengah', island: 'Jawa', pop: 38233.9, growth: 0.97, share: 13.44, density: 1113 },
  { name: 'DI Yogyakarta', island: 'Jawa', pop: 3781.5, growth: 0.64, share: 1.33, density: 1193 },
  { name: 'Jawa Timur', island: 'Jawa', pop: 42089.3, growth: 0.73, share: 14.80, density: 876 },
  { name: 'Banten', island: 'Jawa', pop: 12537.4, growth: 1.10, share: 4.41, density: 1341 },
  { name: 'Bali', island: 'Bali–Nusa Tenggara', pop: 4461.3, growth: 0.69, share: 1.57, density: 798 },
  { name: 'Nusa Tenggara Barat', island: 'Bali–Nusa Tenggara', pop: 5731.1, growth: 1.58, share: 2.01, density: 291 },
  { name: 'Nusa Tenggara Timur', island: 'Bali–Nusa Tenggara', pop: 5742.6, growth: 1.60, share: 2.02, density: 124 },
  { name: 'Kalimantan Barat', island: 'Kalimantan', pop: 5766.0, growth: 1.33, share: 2.03, density: 39 },
  { name: 'Kalimantan Tengah', island: 'Kalimantan', pop: 2845.0, growth: 1.35, share: 1.00, density: 19 },
  { name: 'Kalimantan Selatan', island: 'Kalimantan', pop: 4323.3, growth: 1.26, share: 1.52, density: 116 },
  { name: 'Kalimantan Timur', island: 'Kalimantan', pop: 4267.6, growth: 2.67, share: 1.50, density: 34 },
  { name: 'Kalimantan Utara', island: 'Kalimantan', pop: 749.4, growth: 1.39, share: 0.26, density: 11 },
  { name: 'Sulawesi Utara', island: 'Sulawesi', pop: 2721.4, growth: 0.79, share: 0.96, density: 188 },
  { name: 'Sulawesi Tengah', island: 'Sulawesi', pop: 3156.1, growth: 1.18, share: 1.11, density: 51 },
  { name: 'Sulawesi Selatan', island: 'Sulawesi', pop: 9563.1, growth: 1.11, share: 3.36, density: 211 },
  { name: 'Sulawesi Tenggara', island: 'Sulawesi', pop: 2836.7, growth: 1.65, share: 1.00, density: 78 },
  { name: 'Gorontalo', island: 'Sulawesi', pop: 1242.2, growth: 1.24, share: 0.44, density: 103 },
  { name: 'Sulawesi Barat', island: 'Sulawesi', pop: 1525.3, growth: 1.53, share: 0.54, density: 92 },
  { name: 'Maluku', island: 'Maluku–Papua', pop: 1970.6, growth: 1.35, share: 0.69, density: 43 },
  { name: 'Maluku Utara', island: 'Maluku–Papua', pop: 1373.8, growth: 1.45, share: 0.48, density: 42 },
  { name: 'Papua Barat', island: 'Maluku–Papua', pop: 587.6, growth: 1.68, share: 0.21, density: 10 },
  { name: 'Papua Barat Daya', island: 'Maluku–Papua', pop: 636.4, growth: 1.57, share: 0.22, density: 16 },
  { name: 'Papua', island: 'Maluku–Papua', pop: 1073.6, growth: 1.34, share: 0.38, density: 13 },
  { name: 'Papua Selatan', island: 'Maluku–Papua', pop: 549.7, growth: 1.44, share: 0.19, density: 5 },
  { name: 'Papua Tengah', island: 'Maluku–Papua', pop: 1492.3, growth: 1.49, share: 0.52, density: 24 },
  { name: 'Papua Pegunungan', island: 'Maluku–Papua', pop: 1484.9, growth: 1.39, share: 0.52, density: 29 },
];

// Daftar indikator untuk kotak cari (nama, nilai, halaman tujuan).
const INDICATORS = [
  { name: 'Jumlah penduduk', value: '284,67 juta (2025)', route: '#/penduduk' },
  { name: 'Pertumbuhan penduduk', value: '1,08% per tahun (2020–2025)', route: '#/penduduk' },
  { name: 'PDB harga berlaku', value: 'Rp23.821,1 triliun (2025)', route: '#/ekonomi' },
  { name: 'Pertumbuhan ekonomi', value: '5,11% (2025)', route: '#/ekonomi' },
  { name: 'PDB per kapita', value: 'Rp83,7 juta (2025)', route: '#/ekonomi' },
  { name: 'Inflasi Desember', value: '2,92% yoy (Des 2025)', route: '#/harga' },
  { name: 'Pengangguran terbuka (TPT)', value: '4,85% (Agu 2025)', route: '#/kerja' },
  { name: 'Penduduk bekerja', value: '146,54 juta (Agu 2025)', route: '#/kerja' },
  { name: 'Pengangguran muda 15–24', value: '16,89% (Agu 2025)', route: '#/kerja' },
  { name: 'Kemiskinan', value: '8,25% (Sep 2025)', route: '#/sosial' },
  { name: 'Garis kemiskinan', value: 'Rp641.443/kapita/bulan (Sep 2025)', route: '#/harga' },
  { name: 'Gini ratio', value: '0,363 (Sep 2025)', route: '#/sosial' },
  { name: 'IPM', value: '75,90 (2025) · 76,59 (2026)', route: '#/sosial' },
  { name: 'Umur harapan hidup', value: '74,47 tahun (2025)', route: '#/sosial' },
  { name: 'Pengguna internet', value: '229,43 juta · 80,66% (2025)', route: '#/sosial' },
  { name: 'Ekspor total', value: 'US$282,91 miliar (2025)', route: '#/ekonomi' },
  { name: 'Surplus perdagangan', value: '± US$41,05 miliar (2025)', route: '#/ekonomi' },
  { name: 'Penduduk per provinsi', value: '38 provinsi, proyeksi 2025', route: '#/provinsi' },
  { name: 'Banding provinsi', value: 'Bandingkan 2 provinsi', route: '#/banding' },
  { name: 'Sumber & metodologi', value: 'Semua sumber per indikator', route: '#/data' },
];

// Daftar sumber per indikator untuk halaman Data & Metodologi.
const SOURCES = [
  { ind: 'Jumlah & struktur penduduk', src: 'BPS, SUPAS 2025 — BRS No. 51/05/Th. XXIX, 5 Mei 2026', note: '284,67 jt jiwa; laki-laki 143,64 jt, perempuan 141,03 jt; usia produktif 68,94%; lansia 11,97%.' },
  { ind: 'Penduduk per provinsi', src: 'BPS, Proyeksi Penduduk Indonesia 2020–2050 (hasil SP2020), pertengahan 2025', note: 'Total tabel provinsi 284,44 jt jiwa — proyeksi, bukan SUPAS.' },
  { ind: 'PDB & pertumbuhan ekonomi', src: 'BPS, rilis 5 Feb 2026', note: 'PDB harga berlaku Rp23.821,1 T; harga konstan 2010 Rp13.580,5 T; tumbuh 5,11%.' },
  { ind: 'PDB per kapita', src: 'BPS 2025 (Rp83,7 jt) · World Bank WDI (US$1.445,6 miliar PDB)', note: 'Nilai dolar dari World Bank WDI, diakses langsung.' },
  { ind: 'Inflasi', src: 'BPS, BRS No. 01/01/Th. XXIX, 5 Jan 2026 · komponen via Bank Indonesia', note: 'Des 2025 yoy 2,92% (IHK 109,92; 2022=100); inti 2,38%, volatile food 6,21%, administered 1,93%.' },
  { ind: 'Ketenagakerjaan', src: 'BPS, Sakernas Agustus 2025', note: 'TPT 4,85% (7,46 jt orang); bekerja 146,54 jt; TPT muda 15–24 th 16,89%.' },
  { ind: 'Kemiskinan', src: 'BPS, Profil Kemiskinan September 2025 (BRS 5 Feb 2026)', note: '8,25% (23,36 jt orang); kota 6,60%, desa 10,72%; garis kemiskinan Rp641.443; Gini 0,363; ekstrem 0,78%.' },
  { ind: 'IPM & komponennya', src: 'BPS, BRS No. 104/11/Th. XXVIII, 5 Nov 2025', note: 'IPM 75,90; UHH 74,47 th; harapan lama sekolah 13,30 th; rata-rata lama sekolah 9,07 th; pengeluaran riil Rp12.802.000.' },
  { ind: 'Pembaruan Nov 2026', src: 'BPS, rilis 5 Nov 2026 · BRS No. 113/11/Th. XXIX', note: 'IPM 2026 76,59; UHH 2026 74,68 th; TPT Agu 2026 4,75% (7,38 jt penganggur).' },
  { ind: 'Internet', src: 'APJII, Survei Penetrasi Internet Indonesia 2025', note: '229,43 jt pengguna; penetrasi 80,66% populasi.' },
  { ind: 'Perdagangan luar negeri', src: 'BPS, rilis 2 Feb 2026', note: 'Ekspor US$282,91 M (+6,15%); nonmigas US$269,84 M; migas US$13,07 M; impor US$241,86 M; surplus ± US$41,05 M.' },
  { ind: 'Struktur PDB & pengeluaran', src: 'BPS 2025 (via publikasi GoodStats/DDTC)', note: 'Sektor: industri 19,07%, perdagangan 13,17%, pertanian 13,10%, konstruksi 9,83%, pertambangan 8,75%. Pengeluaran: konsumsi RT 53,88%, PMTB 28,77%, ekspor 22,85%. Kontribusi Jawa 56,93%.' },
];
