// AngkaKita — semua grafik digambar tangan sebagai SVG, tanpa library.
// Fungsi-fungsi di sini hanya menerima angka dan mengembalikan string SVG.

const INK = '#2b2620';
const BRICK = '#b4552d';
const OLIVE = '#6b7a3a';
const SAND = '#e8ddc9';
const FAINT = '#8a8175';

// Angka Indonesia: koma desimal, titik ribuan.
function fmtID(n, dec) {
  const d = dec === undefined ? 2 : dec;
  const parts = Number(n).toFixed(d).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
}

// Skala linear: petakan nilai ke koordinat piksel.
function scaler(values, top, bottom, padTop, padBottom) {
  let lo = Math.min.apply(null, values);
  let hi = Math.max.apply(null, values);
  if (lo === hi) { lo -= 1; hi += 1; }
  const span = hi - lo;
  const loPad = lo - span * padBottom;
  const hiPad = hi + span * padTop;
  const range = hiPad - loPad;
  return function (v) { return top + (1 - (v - loPad) / range) * (bottom - top); };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

// Grafik garis dengan label sumbu dan label ujung. values sejajar labels.
function lineChart(labels, values, opts) {
  const o = opts || {};
  const w = o.width || 560, h = o.height || 260;
  const ml = 46, mr = 14, mt = 16, mb = 30;
  const y = scaler(values, mt, h - mb, 0.12, 0.12);
  const step = (w - ml - mr) / (values.length - 1);
  const xs = values.map(function (_, i) { return ml + i * step; });
  const points = values.map(function (v, i) { return xs[i].toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
  const color = o.color || BRICK;
  const hi = Math.max.apply(null, values);
  const lo = Math.min.apply(null, values);
  let ticks = '';
  [hi, (hi + lo) / 2, lo].forEach(function (t) {
    const yy = y(t);
    ticks += '<line x1="' + ml + '" y1="' + yy.toFixed(1) + '" x2="' + (w - mr) + '" y2="' + yy.toFixed(1) + '" stroke="#e3d9c4" stroke-width="1"/>'
      + '<text x="' + (ml - 6) + '" y="' + (yy + 4).toFixed(1) + '" font-size="11" fill="' + FAINT + '" text-anchor="end">' + fmtID(t, o.dec === undefined ? 1 : o.dec) + '</text>';
  });
  let dots = '';
  values.forEach(function (v, i) {
    if (i === 0 || i === values.length - 1 || v === hi || v === lo) {
      dots += '<circle cx="' + xs[i].toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3.5" fill="' + color + '"/>'
        + '<text x="' + xs[i].toFixed(1) + '" y="' + (y(v) - 9).toFixed(1) + '" font-size="12" font-weight="700" fill="' + INK + '" text-anchor="middle">' + fmtID(v, o.dec === undefined ? 1 : o.dec) + '</text>';
    }
  });
  let xl = '';
  labels.forEach(function (lb, i) {
    if (i % 2 === 0 || i === labels.length - 1) {
      xl += '<text x="' + xs[i].toFixed(1) + '" y="' + (h - 8) + '" font-size="11" fill="' + FAINT + '" text-anchor="middle">' + lb + '</text>';
    }
  });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || 'Grafik garis') + '">'
    + ticks
    + '<polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
    + dots + xl + '</svg>';
}

// Grafik batang vertikal. Sorot satu batang (mis. 2020, pandemi) dengan warna lain.
function barChart(labels, values, opts) {
  const o = opts || {};
  const w = o.width || 560, h = o.height || 260;
  const ml = 46, mr = 10, mt = 22, mb = 30;
  const minV = Math.min(0, Math.min.apply(null, values));
  const maxV = Math.max.apply(null, values);
  const y = scaler([minV, maxV], mt, h - mb, 0.15, 0.05);
  const zeroY = y(0);
  const slot = (w - ml - mr) / values.length;
  const bw = Math.min(34, slot * 0.62);
  let bars = '';
  values.forEach(function (v, i) {
    const x = ml + i * slot + (slot - bw) / 2;
    const top = v >= 0 ? y(v) : zeroY;
    const bh = Math.abs(y(v) - zeroY);
    const fill = (o.highlight !== undefined && i === o.highlight) ? '#8a8175' : (v < 0 ? '#9c3d1e' : (o.color || BRICK));
    bars += '<rect x="' + x.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(bh, 1.5).toFixed(1) + '" rx="2" fill="' + fill + '"/>'
      + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (v >= 0 ? top - 5 : top + bh + 13).toFixed(1) + '" font-size="11" font-weight="700" fill="' + INK + '" text-anchor="middle">' + fmtID(v, o.dec === undefined ? 2 : o.dec) + '</text>'
      + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (h - 8) + '" font-size="11" fill="' + FAINT + '" text-anchor="middle">' + labels[i] + '</text>';
  });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || 'Grafik batang') + '">'
    + '<line x1="' + ml + '" y1="' + zeroY.toFixed(1) + '" x2="' + (w - mr) + '" y2="' + zeroY.toFixed(1) + '" stroke="#c9bda2" stroke-width="1"/>'
    + bars + '</svg>';
}

// Batang horizontal berlabel — untuk ekspor dan pangsa.
function hbarChart(items, opts) {
  const o = opts || {};
  const w = o.width || 560;
  const rowH = o.rowH || 34, topPad = 8;
  const h = topPad + items.length * rowH + 6;
  const maxV = Math.max.apply(null, items.map(function (it) { return it.value; }));
  const labelW = o.labelW || 210;
  const valW = 64;
  const barW = w - labelW - valW - 12;
  let rows = '';
  items.forEach(function (it, i) {
    const y = topPad + i * rowH;
    const bw = Math.max(3, (it.value / maxV) * barW);
    const fill = it.color || (i === 0 ? BRICK : (o.color || '#c97e56'));
    rows += '<text x="0" y="' + (y + 15) + '" font-size="12.5" fill="' + INK + '">' + esc(it.name) + '</text>'
      + '<rect x="' + labelW + '" y="' + (y + 2) + '" width="' + bw.toFixed(1) + '" height="16" rx="2" fill="' + fill + '"/>'
      + '<text x="' + (labelW + bw + 6).toFixed(1) + '" y="' + (y + 15) + '" font-size="12" font-weight="700" fill="' + INK + '">' + fmtID(it.value, o.dec === undefined ? 1 : o.dec) + (o.suffix || '') + '</text>';
  });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || 'Batang horizontal') + '">' + rows + '</svg>';
}

// Donat: items = [{name, share, color}]. Label persen di dalam irisan besar.
function donut(items, opts) {
  const o = opts || {};
  const size = o.size || 300;
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, inner = r * 0.58;
  const total = items.reduce(function (a, it) { return a + it.share; }, 0);
  let angle = -Math.PI / 2;
  let paths = '';
  let legends = '';
  items.forEach(function (it, i) {
    const frac = it.share / total;
    const a0 = angle, a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1), yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0), yi0 = cy + inner * Math.sin(a0);
    const color = it.color || ['#b4552d', '#6b7a3a', '#d9a441', '#4f6d7a', '#8a8175', '#c97e56'][i % 6];
    paths += '<path d="M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1)
      + ' L ' + xi1.toFixed(1) + ' ' + yi1.toFixed(1) + ' A ' + inner + ' ' + inner + ' 0 ' + large + ' 0 ' + xi0.toFixed(1) + ' ' + yi0.toFixed(1) + ' Z" fill="' + color + '" stroke="#faf6ef" stroke-width="2"/>';
    if (frac >= 0.09) {
      const am = (a0 + a1) / 2;
      const tx = cx + (r + inner) / 2 * Math.cos(am);
      const ty = cy + (r + inner) / 2 * Math.sin(am);
      paths += '<text x="' + tx.toFixed(1) + '" y="' + (ty + 4).toFixed(1) + '" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">' + fmtID(it.share, 1) + '%</text>';
    }
    legends += '<div class="legend-row"><span class="swatch" style="background:' + color + '"></span><span>' + esc(it.name) + '</span><b>' + fmtID(it.share, 2) + '%</b></div>';
  });
  return '<div class="donut-wrap"><svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + esc(o.label || 'Donat') + '">' + paths
    + '<text x="' + cx + '" y="' + (cy - 4) + '" font-size="15" font-weight="700" fill="' + INK + '" text-anchor="middle">' + esc(o.center || '') + '</text>'
    + '<text x="' + cx + '" y="' + (cy + 14) + '" font-size="11" fill="' + FAINT + '" text-anchor="middle">' + esc(o.centerSub || '') + '</text></svg>'
    + '<div class="legend">' + legends + '</div></div>';
}

// Sparkline mini untuk kartu KPI.
function sparkline(values, opts) {
  const o = opts || {};
  const w = o.width || 180, h = o.height || 36;
  const lo = Math.min.apply(null, values), hi = Math.max.apply(null, values);
  const span = (hi - lo) || 1;
  const step = w / (values.length - 1);
  const pts = values.map(function (v, i) {
    return (i * step).toFixed(1) + ',' + (h - 4 - ((v - lo) / span) * (h - 8)).toFixed(1);
  }).join(' ');
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="' + (o.color || BRICK) + '" stroke-width="2" stroke-linejoin="round"/></svg>';
}
