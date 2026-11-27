// AngkaKita — routing hash, halaman, dan semua kontrol situs.
// Data dibaca dari data.js; grafik digambar oleh charts.js. Tanpa network.

const NAV = [
  { route: '#/beranda', label: 'Beranda' },
  { route: '#/penduduk', label: 'Penduduk' },
  { route: '#/ekonomi', label: 'Ekonomi' },
  { route: '#/kerja', label: 'Kerja' },
  { route: '#/harga', label: 'Harga' },
  { route: '#/provinsi', label: 'Provinsi' },
  { route: '#/sosial', label: 'Sosial' },
  { route: '#/data', label: 'Data & Metode' },
];

const state = {
  refYear: 2025,
  popType: 'line', popRange: 'all',
  gdpType: 'bar', gdpRange: 'all',
  inflType: 'line', inflRange: 'all',
  provSort: 'pop', provDir: -1, provFilter: '',
  cmpA: 'Jawa Barat', cmpB: 'DKI Jakarta',
};

const view = document.getElementById('view');

function routeNow() {
  const h = location.hash || '#/beranda';
  return h.replace(/^#\//, '');
}

function navHtml(active) {
  return NAV.map(function (n) {
    const on = n.route === '#/' + active ? ' class="active"' : '';
    return '<a href="' + n.route + '"' + on + '>' + n.label + '</a>';
  }).join('');
}

function stripHtml() {
  return '<div class="wrap"><span class="tag">Pembaruan Nov 2026 · BPS</span>'
    + UPDATE_2026.map(function (u) {
      return '<span><b>' + u.label + ':</b> ' + u.value + ' <span class="src">(' + u.note + ')</span></span>';
    }).join('') + '</div>';
}

// Label donat pulau: tanpa angka juta jiwa bila tidak dirilis (Maluku–Papua).
function islandLabel(i) {
  return i.pop === '—' ? i.name : i.name + ' — ' + i.pop;
}
function sliceRange(labels, values, range) {
  if (range === 'early') return { labels: labels.slice(0, 5), values: values.slice(0, 5) };
  if (range === 'late') return { labels: labels.slice(5), values: values.slice(5) };
  return { labels: labels, values: values };
}

function rangeButtons(prefix, current) {
  const opts = [['all', 'Semua'], ['early', '2015–19'], ['late', '2020–25']];
  return '<span class="lbl">Rentang:</span>' + opts.map(function (o) {
    return '<button class="toggle' + (current === o[0] ? ' on' : '') + '" data-' + prefix + '-range="' + o[0] + '">' + o[1] + '</button>';
  }).join('');
}

function typeButtons(prefix, current) {
  return '<span class="lbl">Tampilan:</span>'
    + '<button class="toggle' + (current === 'line' ? ' on' : '') + '" data-' + prefix + '-type="line">Garis</button>'
    + '<button class="toggle' + (current === 'bar' ? ' on' : '') + '" data-' + prefix + '-type="bar">Batang</button>';
}

// ---- Kartu KPI Beranda ----
function kpiCard(k) {
  const is25 = state.refYear === 2025;
  const val = is25 ? k.value25 : (k.value24 || k.value25);
  const yearTag = is25 ? '2025' : (k.value24 ? '2024' : '2025');
  const delta = is25 ? k.delta : (k.value24 ? 'Tahun referensi 2024' : k.delta);
  return '<a class="kpi" href="' + k.route + '">'
    + '<div class="k-label">' + k.label + '</div>'
    + '<div class="k-value">' + val + ' <small>' + k.unit + '</small></div>'
    + '<div class="k-delta">' + delta + '</div>'
    + sparkline(k.spark, { color: k.id === 'miskin' || k.id === 'tpt' ? '#6b7a3a' : '#b4552d' })
    + '<div class="k-src">' + k.source + ' · ' + yearTag + '</div>'
    + '</a>';
}

function yearToggleHtml() {
  return '<div class="controls"><span class="lbl">Tahun referensi KPI:</span>'
    + '<span class="year-toggle"><button id="yr-2025" class="' + (state.refYear === 2025 ? 'on' : '') + '">2025</button>'
    + '<button id="yr-2024" class="' + (state.refYear === 2024 ? 'on' : '') + '">2024</button></span>'
    + '<span class="lbl" style="font-weight:400">Nilai 2024 tersedia untuk penduduk, PDB, inflasi, pengangguran, dan kemiskinan.</span></div>';
}

// ---- Halaman: Beranda ----
function pageHome() {
  const pop = sliceRange(YEARS_POP, POP_SERIES, state.popRange);
  const gdp = sliceRange(YEARS_POP, GDP_GROWTH, state.gdpRange);
  const popChart = state.popType === 'line'
    ? lineChart(pop.labels, pop.values, { label: 'Jumlah penduduk 2015–2025', dec: 1, height: 185 })
    : barChart(pop.labels, pop.values, { label: 'Jumlah penduduk 2015–2025', dec: 1, height: 185 });
  const gdpChart = state.gdpType === 'line'
    ? lineChart(gdp.labels, gdp.values, { label: 'Pertumbuhan ekonomi 2015–2025', dec: 2, height: 185 })
    : barChart(gdp.labels, gdp.values, { label: 'Pertumbuhan ekonomi 2015–2025', dec: 2, highlight: gdp.labels.indexOf(2020), height: 185 });
  const top5 = PROVINCES.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 5);
  return '<section class="hero"><h1>Indonesia dalam angka — <em>data resmi, dijelaskan dengan jernih.</em></h1>'
    + '<p>Enam angka utama 2025, deret 11 tahun, 38 provinsi — semua dengan sumber dan tahun.</p></section>'
    + yearToggleHtml()
    + '<div class="kpi-grid">' + KPI.map(kpiCard).join('') + '</div>'
    + '<div class="grid-2">'
    + '<section class="panel"><h3>Jumlah penduduk, 2015–2025</h3><p class="sub">Juta jiwa, pertengahan tahun · BPS (SUPAS/SP2020/proyeksi)</p>'
    + '<div class="controls">' + typeButtons('pop', state.popType) + rangeButtons('pop', state.popRange) + '</div>'
    + popChart + '<p class="source">2025: 284,7 jt (SUPAS 2025). Laju tumbuh 2020–2025: 1,08% per tahun.</p></section>'
    + '<section class="panel"><h3>Pertumbuhan ekonomi, 2015–2025</h3><p class="sub">Persen per tahun · BPS</p>'
    + '<div class="controls">' + typeButtons('gdp', state.gdpType) + rangeButtons('gdp', state.gdpRange) + '</div>'
    + gdpChart + '<p class="source">2025: 5,11%. Batang abu-abu: 2020 (−2,07%), tahun pandemi Covid-19.</p></section>'
    + '</div>'
    + '<h2>Lima provinsi terbesar</h2><p class="lede">Dari 38 provinsi — Jawa Barat sendiri dihuni 50,76 juta jiwa, hampir seperlima Indonesia.</p>'
    + hbarChart(top5.map(function (p) { return { name: p.name, value: p.pop / 1000 }; }), { label: 'Lima provinsi terbesar 2025', dec: 2, suffix: ' jt', labelW: 150 })
    + '<p class="source">BPS, Proyeksi Penduduk 2020–2050, pertengahan 2025. Total nasional tabel provinsi: 284,44 jt jiwa.</p>'
    + '<div class="page-links"><a href="#/provinsi">Lihat 38 provinsi →</a><a href="#/banding">Bandingkan 2 provinsi →</a><a href="#/data">Sumber &amp; metodologi →</a></div>';
}

// ---- Halaman: Penduduk ----
function pagePop() {
  const pop = sliceRange(YEARS_POP, POP_SERIES, state.popRange);
  const chart = state.popType === 'line'
    ? lineChart(pop.labels, pop.values, { label: 'Jumlah penduduk 2015–2025', dec: 1 })
    : barChart(pop.labels, pop.values, { label: 'Jumlah penduduk 2015–2025', dec: 1 });
  return '<section class="page-head"><h1>Penduduk</h1><p>284,67 juta jiwa pada 2025 — dan penjelas jujur kenapa tiga angka penduduk 2025 bisa berbeda.</p></section>'
    + '<div class="fact-grid">'
    + fact('284,67 jt', 'Jumlah penduduk 2025', 'BPS, SUPAS 2025')
    + fact('1,08%', 'Laju tumbuh per tahun, 2020–2025', 'BPS, SUPAS 2025')
    + fact('68,94%', 'Usia produktif 15–64 th (2025)', 'BPS, SUPAS 2025')
    + fact('11,97%', 'Lansia 60+ (2025)', 'BPS, SUPAS 2025')
    + fact('143,64 jt', 'Laki-laki — 50,46% (2025)', 'BPS, SUPAS 2025')
    + fact('141,03 jt', 'Perempuan — 49,54% (2025)', 'BPS, SUPAS 2025')
    + fact('45,05', 'Rasio ketergantungan (2025)', 'BPS, SUPAS 2025')
    + fact('2,13', 'TFR — anak per perempuan (2025)', 'BPS, SUPAS 2025')
    + '</div>'
    + '<div class="grid-2"><section class="panel"><h3>Jumlah penduduk, 2015–2025</h3>'
    + '<div class="controls">' + typeButtons('pop', state.popType) + rangeButtons('pop', state.popRange) + '</div>'
    + chart + '<p class="source">Juta jiwa · BPS, SUPAS/SP2020/proyeksi. 2025 = SUPAS (284,67 jt).</p></section>'
    + '<section class="panel"><h3>Di mana orang Indonesia tinggal</h3><p class="sub">Pangsa penduduk menurut pulau · SUPAS 2025</p>'
    + donut(ISLANDS.map(function (i) { return { name: islandLabel(i), share: i.share }; }), { center: '55,65%', centerSub: 'di Pulau Jawa', label: 'Persebaran penduduk menurut pulau' })
    + '<p class="source">BPS, SUPAS 2025. Jawa: 158,41 jt jiwa; Sumatera: 62,32 jt; Sulawesi: 21,06 jt; Kalimantan: 17,75 jt; Bali–Nusa Tenggara: 15,95 jt.</p></section></div>'
    + '<h2>Struktur umur &amp; kelahiran</h2>'
    + '<div class="grid-2"><section class="panel"><h3>Siapa yang produktif</h3>'
    + hbarChart([
      { name: 'Usia 0–14 tahun', value: 19.09 },
      { name: 'Usia produktif 15–64', value: 68.94 },
      { name: 'Lansia 60+ tahun', value: 11.97 },
    ], { label: 'Struktur umur 2025', dec: 2, suffix: '%', labelW: 170 })
    + '<p class="source">BPS, SUPAS 2025. Pangsa 0–14 tahun (19,09%) dihitung dari 100% − 68,94% − 11,97%.</p></section>'
    + '<section class="panel"><h3>Kelahiran &amp; kematian</h3>'
    + '<p><b>TFR 2,13</b> anak per perempuan (2025) · <b>IMR 14,12</b> per 1.000 kelahiran hidup · <b>MMR 144</b> per 100.000 kelahiran hidup.</p>'
    + '<p class="source">BPS, SUPAS 2025.</p>'
    + '<div class="note"><b>Kenapa ada tiga angka penduduk 2025?</b> SUPAS 284,67 jt (survei), Proyeksi BPS 284,44 jt (proyeksi pertengahan tahun), Dukcapil 288,32 jt (administrasi, 31 Des 2025). Ketiganya benar menurut metodenya. Situs ini memakai SUPAS untuk headline dan Proyeksi untuk tabel provinsi — lihat halaman Data &amp; Metodologi.</div>'
    + '</section></div>'
    + '<div class="page-links"><a href="#/provinsi">Tabel 38 provinsi →</a><a href="#/sosial">Kesehatan &amp; pendidikan →</a></div>';
}

function fact(value, label, src) {
  return '<div class="fact"><div class="f-value">' + value + '</div><div class="f-label">' + label + '</div><div class="f-src">' + src + '</div></div>';
}

// ---- Halaman: Ekonomi ----
function pageEcon() {
  return '<section class="page-head"><h1>Ekonomi</h1><p>PDB Rp23.821,1 triliun pada 2025, tumbuh 5,11% — didorong industri pengolahan dan konsumsi rumah tangga.</p></section>'
    + '<div class="fact-grid">'
    + fact('Rp23.821,1 T', 'PDB harga berlaku 2025', 'BPS, rilis 5 Feb 2026')
    + fact('5,11%', 'Pertumbuhan ekonomi 2025', 'BPS')
    + fact('Rp83,7 jt', 'PDB per kapita 2025', 'BPS · ± US$5.060 (World Bank)')
    + fact('US$282,91 M', 'Ekspor barang 2025 (+6,15%)', 'BPS, rilis 2 Feb 2026')
    + '</div>'
    + '<div class="grid-2"><section class="panel"><h3>Struktur PDB menurut lapangan usaha</h3><p class="sub">Pangsa terhadap PDB, 2025 · BPS</p>'
    + donut(SECTORS.map(function (s) { return { name: s.name + ' — ' + s.note, share: s.share }; }), { center: '19,07%', centerSub: 'industri pengolahan', label: 'Struktur PDB 2025' })
    + '</section>'
    + '<section class="panel"><h3>Ekspor menurut golongan barang</h3><p class="sub">US$ miliar, 2025 · BPS</p>'
    + hbarChart(EXPORTS_HS, { label: 'Ekspor 2025 menurut golongan HS', dec: 1, suffix: '', labelW: 235 })
    + '<p class="source">Batu bara US$24,5 M dan CPO + turunan ± US$24,4 M adalah komoditas terbesar di dalam golongannya. Total ekspor US$282,91 M; nonmigas US$269,84 M; migas US$13,07 M.</p></section></div>'
    + '<div class="grid-2"><section class="panel"><h3>PDB menurut pengeluaran</h3><p class="sub">Pangsa terhadap PDB, 2025 · BPS</p>'
    + hbarChart(SPENDING.map(function (s) { return { name: s.name, value: s.share }; }), { label: 'PDB menurut pengeluaran 2025', dec: 2, suffix: '%', labelW: 235 })
    + '<p class="source">Sisanya: konsumsi pemerintah, perubahan inventori, dan impor (pengurang). Ketiga komponen di atas tidak berjumlah 100% karena impor mengurangi PDB.</p></section>'
    + '<section class="panel"><h3>Di mana ekonomi berputar</h3>'
    + '<p><b>Pulau Jawa menyumbang 56,93%</b> PDB nasional 2025 dan tumbuh 5,30% — lebih cepat dari rata-rata nasional 5,11%.</p>'
    + '<p><b>PDB harga konstan 2010:</b> Rp13.580,5 triliun (2025). <b>PDB 2024:</b> Rp22.139,0 triliun, tumbuh 5,03%.</p>'
    + '<p><b>Neraca dagang 2025:</b> impor US$241,86 M, surplus ± US$41,05 M.</p>'
    + '<p class="source">BPS, rilis 5 Feb 2026 &amp; 2 Feb 2026.</p></section></div>'
    + '<div class="page-links"><a href="#/harga">Harga &amp; inflasi →</a><a href="#/kerja">Ketenagakerjaan →</a></div>';
}

// ---- Halaman: Kerja ----
function pageWork() {
  return '<section class="page-head"><h1>Kerja</h1><p>146,54 juta orang bekerja pada Agustus 2025; pengangguran terbuka 4,85% — terendah dalam deret enam tahun ini.</p></section>'
    + '<div class="fact-grid">'
    + fact('4,85%', 'TPT Agustus 2025', 'BPS, Sakernas Agu 2025')
    + fact('146,54 jt', 'Penduduk bekerja, Agu 2025', 'BPS, Sakernas Agu 2025')
    + fact('7,46 jt', 'Penganggur, Agu 2025', 'BPS, Sakernas Agu 2025')
    + fact('16,89%', 'TPT usia muda 15–24 th', 'BPS, Sakernas Agu 2025')
    + '</div>'
    + '<div class="grid-2"><section class="panel"><h3>Pengangguran terbuka, 2020–2025</h3><p class="sub">Persen, Agustus tiap tahun · BPS Sakernas</p>'
    + lineChart(TPT_YEARS, TPT_SERIES, { label: 'TPT 2020–2025', dec: 2 })
    + '<p class="source">Turun tiap tahun sejak puncak pandemi 7,07% (2020). Pembaruan: TPT Agustus 2026 = 4,75% (7,38 jt penganggur), BPS 5 Nov 2026.</p></section>'
    + '<section class="panel"><h3>Yang paling sulit mendapat kerja</h3>'
    + '<p>Pengangguran muda (15–24 tahun) <b>16,89%</b> — lebih dari tiga kali lipat angka nasional 4,85%. Lulusan baru dan pencari kerja pertama adalah kelompok yang paling terdampak.</p>'
    + '<p>Dari 146,54 juta orang bekerja, sebagian besar terserap di sektor informal dan jasa — lihat struktur PDB di halaman Ekonomi untuk konteks lapangannya.</p>'
    + '<p class="source">BPS, Sakernas Agustus 2025.</p></section></div>'
    + '<div class="page-links"><a href="#/sosial">Kemiskinan &amp; IPM →</a><a href="#/ekonomi">Ekonomi →</a></div>';
}

// ---- Halaman: Harga ----
function pagePrice() {
  const inf = sliceRange(YEARS_POP, INFLATION, state.inflRange);
  const chart = state.inflType === 'line'
    ? lineChart(inf.labels, inf.values, { label: 'Inflasi Desember yoy 2015–2025', dec: 2 })
    : barChart(inf.labels, inf.values, { label: 'Inflasi Desember yoy 2015–2025', dec: 2, highlight: inf.labels.indexOf(2022) });
  return '<section class="page-head"><h1>Harga</h1><p>Inflasi Desember 2025: 2,92% year-on-year — di dalam sasaran Bank Indonesia 2,5% ± 1%.</p></section>'
    + '<div class="fact-grid">'
    + fact('2,92%', 'Inflasi Des 2025 (yoy)', 'BPS, BRS 5 Jan 2026')
    + fact('109,92', 'IHK Des 2025 (2022=100)', 'BPS')
    + fact('2,38%', 'Inflasi inti Des 2025', 'BPS via Bank Indonesia')
    + fact('6,21%', 'Volatile food Des 2025', 'BPS via Bank Indonesia')
    + '</div>'
    + '<div class="grid-2"><section class="panel"><h3>Inflasi Desember (yoy), 2015–2025</h3>'
    + '<div class="controls">' + typeButtons('infl', state.inflType) + rangeButtons('infl', state.inflRange) + '</div>'
    + chart + '<p class="source">Persen, Desember year-on-year · BPS. Puncak 5,51% (2022) saat harga energi dunia melonjak; terendah 1,57% (2024).</p></section>'
    + '<section class="panel"><h3>Apa yang menggerakkan harga</h3>'
    + hbarChart([
      { name: 'Inflasi inti', value: 2.38 },
      { name: 'Administered prices', value: 1.93 },
      { name: 'Volatile food', value: 6.21 },
    ], { label: 'Komponen inflasi Des 2025', dec: 2, suffix: '%', labelW: 170 })
    + '<p class="source">BPS via Bank Indonesia, Desember 2025. Pangan bergejolak (volatile food) adalah penyumbang inflasi terbesar — 6,21%.</p>'
    + '<div class="note"><b>Jangan campur dua inflasi.</b> Angka di situs ini adalah inflasi <b>Desember year-on-year</b> BPS (2,92% untuk 2025). Rata-rata tahunan World Bank untuk 2025 adalah 1,91% — angka yang berbeda karena metodenya berbeda. Lihat halaman Data &amp; Metodologi.</div>'
    + '</section></div>'
    + '<h2>Harga dan daya beli</h2>'
    + '<div class="fact-grid">'
    + fact('Rp641.443', 'Garis kemiskinan /kapita/bulan, Sep 2025', 'BPS')
    + fact('2,5% ± 1%', 'Sasaran inflasi Bank Indonesia', 'Bank Indonesia')
    + fact('1,93%', 'Administered prices Des 2025', 'BPS via Bank Indonesia')
    + fact('1,57%', 'Inflasi Des 2024 — terendah sejak 1958', 'BPS')
    + '</div>'
    + '<div class="page-links"><a href="#/sosial">Kemiskinan →</a><a href="#/data">Metodologi inflasi →</a></div>';
}

// ---- Halaman: Provinsi ----
function sortedProvinces() {
  const q = state.provFilter.trim().toLowerCase();
  const rows = PROVINCES.filter(function (p) {
    return !q || p.name.toLowerCase().indexOf(q) !== -1 || p.island.toLowerCase().indexOf(q) !== -1;
  });
  const key = state.provSort;
  rows.sort(function (a, b) {
    const d = key === 'name' || key === 'island'
      ? (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0)
      : a[key] - b[key];
    return d * state.provDir;
  });
  return rows;
}

function provTableHtml() {
  const rows = sortedProvinces();
  const arrow = function (key) {
    return state.provSort === key ? (state.provDir === 1 ? ' ▲' : ' ▼') : '';
  };
  const head = '<tr><th>#</th>'
    + '<th data-sort="name">Provinsi' + arrow('name') + '</th>'
    + '<th data-sort="island">Pulau' + arrow('island') + '</th>'
    + '<th data-sort="pop">Penduduk (ribu)' + arrow('pop') + '</th>'
    + '<th data-sort="share">Pangsa' + arrow('share') + '</th>'
    + '<th data-sort="growth">Laju tumbuh' + arrow('growth') + '</th>'
    + '<th data-sort="density">Kepadatan' + arrow('density') + '</th></tr>';
  const body = rows.map(function (p, i) {
    return '<tr><td class="rank">' + (i + 1) + '</td><td>' + p.name + '</td><td>' + p.island + '</td>'
      + '<td>' + fmtID(p.pop, 1) + '</td><td>' + fmtID(p.share, 2) + '%</td>'
      + '<td>' + fmtID(p.growth, 2) + '%</td><td>' + fmtID(p.density, 0) + '</td></tr>';
  }).join('');
  return '<div class="table-wrap"><table class="data"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>'
    + '<p class="count-line">Menampilkan ' + rows.length + ' dari 38 provinsi · Penduduk pertengahan 2025 (ribu jiwa) · BPS, Proyeksi Penduduk 2020–2050 · Total nasional tabel ini 284.438,8 ribu jiwa · Klik judul kolom untuk mengurutkan.</p>';
}

function pageProvinces() {
  const top10 = PROVINCES.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 10);
  return '<section class="page-head"><h1>Provinsi</h1><p>38 provinsi, satu sumber yang sama — BPS Proyeksi Penduduk 2020–2050, pertengahan 2025. Urutkan, cari, lalu bandingkan dua provinsi.</p></section>'
    + '<div class="grid-2"><section class="panel"><h3>Sepuluh provinsi terbesar</h3><p class="sub">Juta jiwa, 2025</p>'
    + hbarChart(top10.map(function (p) { return { name: p.name, value: p.pop / 1000 }; }), { label: 'Sepuluh provinsi terbesar 2025', dec: 2, suffix: ' jt', labelW: 165, rowH: 30 })
    + '<p class="source">BPS, Proyeksi Penduduk 2020–2050.</p></section>'
    + '<section class="panel"><h3>Bandingkan dua provinsi</h3><p class="sub">Jawa Barat vs DKI Jakarta: penduduk terbesar melawan yang terpadat</p>'
    + '<div id="prov-compare"></div>'
    + '<p class="source">Pilih provinsi di bawah ini — atau buka alat banding lengkap di halaman Banding.</p>'
    + '<div class="page-links"><a href="#/banding">Buka alat banding →</a></div></section></div>'
    + '<div class="grid-2"><section class="panel"><h3>Persebaran menurut pulau</h3><p class="sub">Pangsa penduduk · SUPAS 2025</p>'
    + donut(ISLANDS.map(function (i) { return { name: islandLabel(i), share: i.share }; }), { center: '55,65%', centerSub: 'di Pulau Jawa', label: 'Persebaran penduduk menurut pulau', size: 240 })
    + '<p class="source">BPS, SUPAS 2025.</p></section>'
    + '<section class="panel"><h3>Rekor antarpovinsi</h3>'
    + '<p><b>Terbesar:</b> Jawa Barat — 50.759,0 ribu jiwa (17,85% Indonesia).<br>'
    + '<b>Terkecil:</b> Papua Selatan — 549,7 ribu jiwa, 92 kali lebih kecil dari Jawa Barat.<br>'
    + '<b>Terpadat:</b> DKI Jakarta — 16.155 jiwa/km².<br>'
    + '<b>Terjarang:</b> Papua Selatan — 5 jiwa/km².<br>'
    + '<b>Laju tumbuh tertinggi:</b> Kalimantan Timur — 2,67% per tahun.<br>'
    + '<b>Laju tumbuh terendah:</b> DKI Jakarta — 0,23% per tahun.</p>'
    + '<p class="source">BPS, Proyeksi Penduduk 2020–2050, pertengahan 2025.</p></section></div>'
    + '<h2>Tabel 38 provinsi</h2>'
    + '<div class="table-tools"><input id="prov-filter" type="search" placeholder="Cari nama provinsi atau pulau…" aria-label="Cari provinsi" value="' + state.provFilter.replace(/"/g, '&quot;') + '">'
    + '<span class="count-line">Klik judul kolom untuk mengurutkan naik / turun.</span></div>'
    + '<div id="prov-table">' + provTableHtml() + '</div>';
}

// ---- Halaman: Banding ----
function provinceOptions(selected) {
  const sorted = PROVINCES.slice().sort(function (a, b) { return b.pop - a.pop; });
  return sorted.map(function (p) {
    return '<option value="' + p.name + '"' + (p.name === selected ? ' selected' : '') + '>' + p.name + ' — ' + fmtID(p.pop / 1000, 2) + ' jt</option>';
  }).join('');
}

function compareHtml(aName, bName, compact) {
  const a = PROVINCES.find(function (p) { return p.name === aName; });
  const b = PROVINCES.find(function (p) { return p.name === bName; });
  if (!a || !b) return '<p>Provinsi tidak ditemukan.</p>';
  const card = function (p, cls, tag) {
    return '<div class="compare-card ' + cls + '"><span class="vs-badge">' + tag + '</span><h3>' + p.name + '</h3>'
      + '<dl><dt>Penduduk (2025)</dt><dd>' + fmtID(p.pop / 1000, 2) + ' jt</dd>'
      + '<dt>Pangsa nasional</dt><dd>' + fmtID(p.share, 2) + '%</dd>'
      + '<dt>Laju tumbuh</dt><dd>' + fmtID(p.growth, 2) + '% / th</dd>'
      + '<dt>Kepadatan</dt><dd>' + fmtID(p.density, 0) + ' jiwa/km²</dd>'
      + '<dt>Pulau</dt><dd>' + p.island + '</dd></dl></div>';
  };
  const ratio = (a.density / b.density);
  const bigger = a.pop >= b.pop ? a.name : b.name;
  const denser = a.density >= b.density ? a.name : b.name;
  let html = '<div class="compare-box"><label>Pilih A <select id="cmp-a">' + provinceOptions(a.name) + '</select></label>'
    + '<button class="toggle" id="cmp-swap" type="button">⇄ Tukar</button>'
    + '<label>Pilih B <select id="cmp-b">' + provinceOptions(b.name) + '</select></label></div>'
    + '<div class="compare-cards">' + card(a, 'first', 'A') + card(b, 'second', 'B') + '</div>';
  if (compact) {
    return html + '<p class="source">BPS, Proyeksi Penduduk 2020–2050, pertengahan 2025.</p>';
  }
  return html
    + '<h3 style="margin-top:18px">Perbandingan batang</h3>'
    + hbarChart([
      { name: a.name + ' — penduduk (jt)', value: a.pop / 1000, color: '#b4552d' },
      { name: b.name + ' — penduduk (jt)', value: b.pop / 1000, color: '#4f6d7a' },
    ], { label: 'Banding penduduk dua provinsi', dec: 2, suffix: ' jt', labelW: 260 })
    + '<p class="source">' + bigger + ' penduduknya lebih besar. ' + denser + ' lebih padat — kepadatan ' + a.name + ' '
    + fmtID(ratio, 1) + '× kepadatan ' + b.name + '.</p>'
    + '<p class="source">BPS, Proyeksi Penduduk 2020–2050, pertengahan 2025.</p>';
}

function pageCompare() {
  return '<section class="page-head"><h1>Banding Provinsi</h1><p>Pilih dua provinsi dan lihat penduduk, pangsa, laju tumbuh, dan kepadatannya berdampingan.</p></section>'
    + '<div id="compare-root">' + compareHtml(state.cmpA, state.cmpB) + '</div>';
}

// ---- Halaman: Sosial ----
function pageSocial() {
  return '<section class="page-head"><h1>Sosial</h1><p>IPM 75,90 pada 2025 — kategori Tinggi — dan kemiskinan 8,25%, terendah dalam deret sebelas tahun.</p></section>'
    + '<div class="fact-grid">'
    + fact('75,90', 'IPM 2025 (kategori Tinggi)', 'BPS, BRS 5 Nov 2025')
    + fact('74,47 th', 'Umur harapan hidup 2025', 'BPS (komponen IPM)')
    + fact('8,25%', 'Kemiskinan Sep 2025', 'BPS, Profil Kemiskinan')
    + fact('80,66%', 'Pengguna internet 2025', 'APJII 2025')
    + '</div>'
    + '<div class="grid-2"><section class="panel"><h3>Indeks Pembangunan Manusia, 2020–2025</h3>'
    + lineChart(IPM_YEARS, IPM_SERIES, { label: 'IPM 2020–2025', dec: 2 })
    + '<p class="source">BPS. Naik 0,69 poin lagi ke 76,59 pada 2026 (rilis 5 Nov 2026).</p></section>'
    + '<section class="panel"><h3>Kemiskinan, September 2015–2025</h3>'
    + lineChart(YEARS_POP, POVERTY, { label: 'Kemiskinan September 2015–2025', dec: 2, color: '#6b7a3a' })
    + '<p class="source">Persen penduduk miskin · BPS, Susenas. Sempat naik saat pandemi (10,19% pada Sep 2020), lalu turun tiap tahun.</p></section></div>'
    + '<h2>Komponen IPM 2025</h2>'
    + '<div class="fact-grid">'
    + fact('74,47 th', 'Umur harapan hidup', 'BPS 2025')
    + fact('13,30 th', 'Harapan lama sekolah', 'BPS 2025')
    + fact('9,07 th', 'Rata-rata lama sekolah', 'BPS 2025')
    + fact('Rp12,80 jt', 'Pengeluaran riil/kapita/th', 'BPS 2025')
    + '</div>'
    + '<div class="grid-2"><section class="panel"><h3>Kemiskinan kota vs desa</h3>'
    + hbarChart([
      { name: 'Perkotaan', value: 6.60 },
      { name: 'Perdesaan', value: 10.72 },
      { name: 'Nasional', value: 8.25 },
    ], { label: 'Kemiskinan kota desa Sep 2025', dec: 2, suffix: '%', labelW: 120 })
    + '<p class="source">BPS, September 2025. Garis kemiskinan Rp641.443/kapita/bulan; kemiskinan ekstrem 0,78%; Gini ratio 0,363.</p></section>'
    + '<section class="panel"><h3>Internet: 4 dari 5 orang online</h3>'
    + lineChart(NET_YEARS, NET_PCT, { label: 'Penetrasi internet 2022–2025', dec: 2, color: '#4f6d7a' })
    + '<p class="source">APJII, Survei Penetrasi Internet. Pengguna: 210,3 jt (2022) → 215,6 jt (2023) → 221,6 jt (2024) → 229,43 jt (2025).</p></section></div>'
    + '<div class="page-links"><a href="#/kerja">Ketenagakerjaan →</a><a href="#/data">Sumber &amp; metodologi →</a></div>';
}

// ---- Halaman: Data & Metodologi ----
function pageData() {
  const items = SOURCES.map(function (s) {
    return '<li><b>' + s.ind + '</b><span class="s-name">' + s.src + '</span><p>' + s.note + '</p></li>';
  }).join('');
  return '<section class="page-head"><h1>Data &amp; Metodologi</h1><p>Semua sumber per indikator — lengkap dengan nomor BRS dan tanggal rilis — plus penjelasan jujur di mana angka bisa membingungkan.</p></section>'
    + '<h2>Sumber per indikator</h2><ul class="src-list">' + items + '</ul>'
    + '<h2>Tiga hal yang sering disalahpahami</h2><ol class="method">'
    + '<li><b>Tiga angka penduduk 2025 — semuanya benar.</b> SUPAS 2025: 284,67 juta (survei, dipakai sebagai headline). Proyeksi BPS 2020–2050: 284,44 juta (proyeksi pertengahan tahun, dipakai untuk tabel provinsi). Dukcapil: 288,32 juta (data administrasi 31 Des 2025). Jangan bandingkan angka dari metode yang berbeda tanpa menyebut metodenya.</li>'
    + '<li><b>Umur harapan hidup BPS ≠ World Bank.</b> UHH BPS 2025 adalah 74,47 tahun; World Bank WDI mencatat 71,29 tahun untuk 2024. Metodenya berbeda — situs ini memakai BPS dan tidak menampilkan keduanya berdampingan tanpa penjelasan.</li>'
    + '<li><b>Inflasi Desember yoy ≠ rata-rata tahunan.</b> Situs ini memakai inflasi Desember year-on-year BPS (2,92% untuk 2025). Rata-rata tahunan World Bank untuk 2025 adalah 1,91%. Keduanya sah; yang satu mengukur Desember lawan Desember, yang lain merata-rata setahun.</li>'
    + '<li><b>Pembulatan.</b> Angka ditampilkan apa adanya dari publikasi; jumlah pangsa bisa berbeda 0,01 poin karena pembulatan.</li>'
    + '</ol>'
    + '<div class="note"><b>Tentang situs ini.</b> AngkaKita adalah situs independen yang menyajikan data resmi BPS, APJII, dan World Bank. Bukan situs resmi BPS. Tidak ada angka yang diambil dari sumber tak bernama; bila sebuah angka belum terverifikasi, angka itu tidak ditampilkan — misalnya angka melek huruf terbaru, yang tidak dimasukkan karena publikasi terakhir yang terverifikasi hanya sampai 2020.</div>'
    + '<div class="page-links"><a href="#/beranda">Kembali ke Beranda →</a></div>';
}

const PAGES = {
  beranda: pageHome, penduduk: pagePop, ekonomi: pageEcon, kerja: pageWork,
  harga: pagePrice, provinsi: pageProvinces, sosial: pageSocial,
  banding: pageCompare, data: pageData,
};

// ---- Kontrol: pasang ulang setiap kali halaman digambar ----
function bindControls() {
  const y25 = document.getElementById('yr-2025');
  if (y25) {
    y25.addEventListener('click', function () { state.refYear = 2025; render(); });
    document.getElementById('yr-2024').addEventListener('click', function () { state.refYear = 2024; render(); });
  }
  document.querySelectorAll('[data-pop-type]').forEach(function (b) {
    b.addEventListener('click', function () { state.popType = b.getAttribute('data-pop-type'); render(); });
  });
  document.querySelectorAll('[data-pop-range]').forEach(function (b) {
    b.addEventListener('click', function () { state.popRange = b.getAttribute('data-pop-range'); render(); });
  });
  document.querySelectorAll('[data-gdp-type]').forEach(function (b) {
    b.addEventListener('click', function () { state.gdpType = b.getAttribute('data-gdp-type'); render(); });
  });
  document.querySelectorAll('[data-gdp-range]').forEach(function (b) {
    b.addEventListener('click', function () { state.gdpRange = b.getAttribute('data-gdp-range'); render(); });
  });
  document.querySelectorAll('[data-infl-type]').forEach(function (b) {
    b.addEventListener('click', function () { state.inflType = b.getAttribute('data-infl-type'); render(); });
  });
  document.querySelectorAll('[data-infl-range]').forEach(function (b) {
    b.addEventListener('click', function () { state.inflRange = b.getAttribute('data-infl-range'); render(); });
  });
  const pf = document.getElementById('prov-filter');
  if (pf) {
    pf.addEventListener('input', function () {
      state.provFilter = pf.value;
      document.getElementById('prov-table').innerHTML = provTableHtml();
      bindSortHeaders();
    });
  }
  bindSortHeaders();
  bindCompare('compare-root');
  bindCompare('prov-compare');
}

function bindSortHeaders() {
  document.querySelectorAll('th[data-sort]').forEach(function (th) {
    th.addEventListener('click', function () {
      const key = th.getAttribute('data-sort');
      if (state.provSort === key) state.provDir = -state.provDir;
      else { state.provSort = key; state.provDir = key === 'name' || key === 'island' ? 1 : -1; }
      const box = document.getElementById('prov-table');
      if (box) { box.innerHTML = provTableHtml(); bindSortHeaders(); }
    });
  });
}

function bindCompare(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  // Gambar ulang alat banding di dalam wadahnya (halaman Provinsi wadahnya
  // kosong sampai di sini; halaman Banding sudah terisi dari pageCompare).
  // Di halaman Provinsi alatnya ringkas (tanpa batang perbandingan) supaya
  // tabel dan donat pulau tetap dekat di bawahnya.
  root.innerHTML = compareHtml(state.cmpA, state.cmpB, rootId === 'prov-compare');
  const a = document.getElementById('cmp-a');
  const b = document.getElementById('cmp-b');
  const swap = document.getElementById('cmp-swap');
  if (!a || !b || !swap) return;
  a.addEventListener('change', function () { state.cmpA = a.value; render(); });
  b.addEventListener('change', function () { state.cmpB = b.value; render(); });
  swap.addEventListener('click', function () {
    const t = state.cmpA; state.cmpA = state.cmpB; state.cmpB = t; render();
  });
}

// ---- Cari indikator (kotak di kepala situs) ----
function bindSearch() {
  const input = document.getElementById('indicator-search');
  const box = document.getElementById('search-results');
  input.addEventListener('input', function () {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
    const hits = INDICATORS.filter(function (it) { return it.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
    if (!hits.length) {
      box.innerHTML = '<div class="search-empty">Tidak ada indikator yang cocok — coba “inflasi”, “IPM”, atau “ekspor”.</div>';
    } else {
      box.innerHTML = hits.map(function (it) {
        return '<a href="' + it.route + '"><b>' + it.name + '</b><span>' + it.value + '</span></a>';
      }).join('');
    }
    box.hidden = false;
  });
  box.addEventListener('click', function (e) {
    if (e.target.closest('a')) { box.hidden = true; input.value = ''; }
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { box.hidden = true; input.value = ''; }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-box')) box.hidden = true;
  });
}

// ---- Render ----
function render() {
  const r = routeNow();
  const page = PAGES[r] || PAGES.beranda;
  document.getElementById('main-nav').innerHTML = navHtml(PAGES[r] ? r : 'beranda');
  view.innerHTML = page();
  bindControls();
  window.scrollTo(0, 0);
}

document.getElementById('update-strip').innerHTML = stripHtml();
bindSearch();
window.addEventListener('hashchange', render);
render();
