/* Portfolio "Love stories": the photos merge into a photo mosaic that forms a heart, two joined rings and an
   engagement ring, changing on its own. Tiles are the gallery's own buttons, so the lightbox keeps working (Nov 12 2026). */
(function () {
  var g = document.querySelector('#pf-g .gallery'); if (!g) return;
  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var L = {
    en: ['Love stories', 'Every photo, a little piece of someone’s story', 'Tap any photo to see it larger'],
    fr: ['Histoires d’amour', 'Chaque photo, un petit morceau de l’histoire d’un couple', 'Touchez une photo pour l’agrandir'],
    es: ['Historias de amor', 'Cada foto, un pedacito de la historia de una pareja', 'Toca una foto para verla en grande'],
    zh: ['爱的故事', '每一张照片，都是一段爱情故事的片段', '点击任意照片查看大图'],
    pa: ['ਪਿਆਰ ਦੀਆਂ ਕਹਾਣੀਆਂ', 'ਹਰ ਫ਼ੋਟੋ, ਕਿਸੇ ਜੋੜੇ ਦੀ ਕਹਾਣੀ ਦਾ ਇੱਕ ਹਿੱਸਾ', 'ਵੱਡਾ ਦੇਖਣ ਲਈ ਕਿਸੇ ਵੀ ਫ਼ੋਟੋ ’ਤੇ ਟੈਪ ਕਰੋ']
  }[lang] || ['Love stories', 'Every photo, a little piece of someone’s story', 'Tap any photo to see it larger'];
  var MODES = ['heart', 'rings', 'ring'];

  // No category buttons here (the albums above already split the work by type): every photo takes part.
  var fl = g.parentNode.querySelector('.filters'); if (fl) fl.remove();
  var F = [].slice.call(g.querySelectorAll(':scope > figure'));
  F.forEach(function (f) { f.hidden = false; });

  var bar = document.createElement('div'); bar.className = 'cg-bar';
  bar.innerHTML = '<span class="cg-eb">' + L[0] + '</span><h2 class="cg-h">' + L[1] + '</h2>';
  g.parentNode.insertBefore(bar, g);
  var tip = document.createElement('span'); tip.className = 'cg-tip'; tip.textContent = L[2];
  g.parentNode.insertBefore(tip, g);

  // Shapes, tested in "shape units" (x right, y down), each with its bounding box.
  function inPoly(x, y, P) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { if (((P[i][1] > y) !== (P[j][1] > y)) && (x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; } return c; }
  var GEM = [[-0.36, -1.62], [0.36, -1.62], [0.62, -1.34], [0, -0.74], [-0.62, -1.34]];
  function circ(cx, cy, r, rev) { var o = []; for (var i = 0; i < 120; i++) { var t = (rev ? -1 : 1) * i / 120 * Math.PI * 2; o.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return o; }
  function heartPoly() { var o = []; for (var i = 0; i < 240; i++) { var t = i / 240 * Math.PI * 2, k = 1 / 16.6; o.push([16 * Math.pow(Math.sin(t), 3) * k * 1.06, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * k * 1.06 - 0.05]); } return o; }
  var HP = heartPoly();
  var SH = {
    heart: { box: [-1.03, -0.82, 1.03, 1.045], polys: [HP], line: [0], fn: function (x, y) { return inPoly(x, y, HP); } },
    rings: { box: [-1.62, -1, 1.62, 1], fn: function (x, y) {
      var d1 = Math.hypot(x + 0.62, y), d2 = Math.hypot(x - 0.62, y);
      return (d1 <= 1 && d1 >= 0.56) || (d2 <= 1 && d2 >= 0.56); },
      polys: [circ(-0.62, 0, 1), circ(-0.62, 0, 0.56, 1), circ(0.62, 0, 1), circ(0.62, 0, 0.56, 1)], line: [0, 1, 2, 3] },
    ring: { box: [-1.02, -1.64, 1.02, 1.04], fn: function (x, y) {
      var d = Math.hypot(x, y + 0.02); return (d <= 1 && d >= 0.6) || inPoly(x, y, GEM); },
      polys: [circ(0, -0.02, 1), circ(0, -0.02, 0.6, 1), GEM], line: [0, 1, 2] }
  };

  // Mosaic: a quadtree over the shape. Cells along the outline keep splitting (so the edge reads crisply),
  // the middle keeps the big tiles, and the split stops when there is one tile per photo.
  function mosaic(sh, W, H, n, minS) {
    var b = sh.box, bw = b[2] - b[0], bh = b[3] - b[1];
    var s = Math.min(W * 0.96 / bw, H * 0.96 / bh), ox = W / 2 - (b[0] + bw / 2) * s, oy = H / 2 - (b[1] + bh / 2) * s;
    function cov(c) { var k = 0, N = 7; for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) { if (sh.fn((c.x + (i + 0.5) / N * c.s - ox) / s, (c.y + (j + 0.5) / N * c.s - oy) / s)) k++; } return k / (N * N); }
    var S0 = Math.min(bw, bh) * s / 2.4, x0 = ox + b[0] * s, y0 = oy + b[1] * s;
    var cols = Math.ceil(bw * s / S0), rows = Math.ceil(bh * s / S0);
    x0 -= (cols * S0 - bw * s) / 2; y0 -= (rows * S0 - bh * s) / 2;
    var cells = [];
    for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) { var c = { x: x0 + q * S0, y: y0 + r * S0, s: S0 }; c.c = cov(c); if (c.c > 0.04) cells.push(c); }
    var TH = 0.22; function tiles() { return cells.filter(function (c) { return c.c >= TH; }).length; }
    var cnt = tiles(), guard = 0;
    // too many cells even before splitting: nothing to do but keep the best-covered ones
    while (guard++ < 600) {
      var cand = cells.filter(function (c) { return c.s / 2 >= minS; }).sort(function (a, b2) {
        var pa = a.s * (a.c < 0.97 ? 1.7 : 1), pb = b2.s * (b2.c < 0.97 ? 1.7 : 1); return pb - pa; });
      var done = false;
      for (var k = 0; k < cand.length && !done; k++) {
        var p = cand[k], h = p.s / 2, kids = [];
        [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (o) { var ch = { x: p.x + o[0] * h, y: p.y + o[1] * h, s: h }; ch.c = p.c >= 0.999 ? 1 : cov(ch); if (ch.c > 0.04) kids.push(ch); });
        var nc = cnt - (p.c >= TH ? 1 : 0) + kids.filter(function (ch) { return ch.c >= TH; }).length;
        if (nc <= n) { cells.splice(cells.indexOf(p), 1); cells = cells.concat(kids); cnt = nc; done = true; }
      }
      if (!done) break;
    }
    var out = cells.filter(function (c) { return c.c >= TH; }).sort(function (a, b2) { return b2.s - a.s || a.y - b2.y || a.x - b2.x; });
    out = out.slice(0, n); out.geo = { s: s, ox: ox, oy: oy }; return out;
  }

  var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), line = document.createElementNS(NS, 'path');
  svg.setAttribute('class', 'cg-line'); svg.setAttribute('aria-hidden', 'true'); svg.appendChild(line); g.appendChild(svg);
  var bsvg = document.createElementNS(NS, 'svg'), back = document.createElementNS(NS, 'path'); bsvg.setAttribute('class', 'cg-back'); bsvg.setAttribute('aria-hidden', 'true'); bsvg.appendChild(back); g.insertBefore(bsvg, g.firstChild);
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  function pathStr(sh, geo, dx, dy, only) {
    var d = ''; sh.polys.forEach(function (P, k) { if (only && only.indexOf(k) < 0) return;
      P.forEach(function (q, i) { d += (i ? 'L' : 'M') + (q[0] * geo.s + geo.ox - dx).toFixed(1) + ' ' + (q[1] * geo.s + geo.oy - dy).toFixed(1); }); d += 'Z'; });
    return d;
  }
  function outline(sh, geo, W, H) {
    [svg, bsvg].forEach(function (e) { e.setAttribute('viewBox', '0 0 ' + W + ' ' + H); e.setAttribute('width', W); e.setAttribute('height', H); });
    back.setAttribute('d', pathStr(sh, geo, 0, 0)); back.style.opacity = 1; line.style.opacity = 1;
    line.style.transition = 'none'; line.setAttribute('d', pathStr(sh, geo, 0, 0, sh.line));
    var len = line.getTotalLength ? line.getTotalLength() : 4000;
    line.style.strokeDasharray = len; line.style.strokeDashoffset = RM ? 0 : len; line.getBoundingClientRect();
    line.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.4,0,.2,1) ' + (laid2 ? '0s' : '.9s'); laid2 = true; line.style.strokeDashoffset = 0;
  }

  var laid2 = false, laid = false, lastMode = '', ct = null;
  var mode = 'heart', timer = null, seen = false, hover = false, turn = 0;
  function aim(f, w, h) {
    var im = f.querySelector('img'); if (!im) return;
    var r = (+im.getAttribute('width') || im.naturalWidth || 4) / (+im.getAttribute('height') || im.naturalHeight || 5);
    var fx = parseFloat(im.getAttribute('data-fx')), fy = parseFloat(im.getAttribute('data-fy'));
    if (isNaN(fx)) fx = 50; if (isNaN(fy)) fy = 38;
    var dw, dh; if (w / h > r) { dw = w; dh = w / r; } else { dh = h; dw = h * r; }
    var ox = dw > w + 1 ? Math.min(0, Math.max(w - dw, w * 0.5 - dw * fx / 100)) : 0;
    var oy = dh > h + 1 ? Math.min(0, Math.max(h - dh, h * 0.45 - dh * fy / 100)) : 0;
    var px = dw > w + 1 ? ox / (w - dw) * 100 : 50, py = dh > h + 1 ? oy / (h - dh) * 100 : 50;
    im.style.setProperty('object-position', px.toFixed(1) + '% ' + py.toFixed(1) + '%', 'important');
  }

  function layout() {
    var W = g.clientWidth; if (!W) return;
    var n = F.length, phone = W < 700, sh = SH[mode], b = sh.box, ar = (b[3] - b[1]) / (b[2] - b[0]);
    g.classList.add('cg-on'); g.setAttribute('data-shape', mode);
    var H = phone ? Math.round(Math.min(W * ar * 1.04, window.innerHeight * 0.86)) : Math.round(Math.min(Math.max(window.innerHeight * 0.86, 600), 860, W * 0.74));
    g.style.height = H + 'px';
    var moving = laid && lastMode !== mode, clips = []; laid = true; lastMode = mode; clearTimeout(ct);
    var T = mosaic(sh, W, H, n, phone ? 22 : 34), gap = phone ? 1.5 : 2.5;
    // rotate which photos get the big tiles each turn
    var order = F.map(function (f, i) { return F[(i + turn * 5) % n]; });
    order.forEach(function (f, i) {
      var t = T[i], btn = f.querySelector('button');
      if (!t) { // no room in this shape: tuck it away (it is still in the lightbox)
        f.classList.add('cg-off'); f.style.zIndex = 0; if (btn) btn.tabIndex = -1;
        f.style.setProperty('--x', (W / 2 - 20) + 'px'); f.style.setProperty('--y', (H / 2 - 20) + 'px');
        f.style.setProperty('--w', '40px'); f.style.setProperty('--h', '40px'); f.style.setProperty('--r', '0deg');
        return;
      }
      f.classList.remove('cg-off'); if (btn) btn.removeAttribute('tabindex');
      var w = t.s - gap * 2;
      f.style.setProperty('--x', (t.x + gap).toFixed(1) + 'px'); f.style.setProperty('--y', (t.y + gap).toFixed(1) + 'px');
      f.style.setProperty('--w', w.toFixed(1) + 'px'); f.style.setProperty('--h', w.toFixed(1) + 'px'); f.style.setProperty('--r', '0deg');
      f.style.setProperty('--hs', w > 220 ? 1.1 : w > 120 ? 1.3 : phone ? 1.6 : 1.9);
      f.style.setProperty('--d', (i * 0.025).toFixed(3) + 's');
      f.style.zIndex = 2;
      // cut the tile along the shape so together the photos form a clean heart / ring outline
      // (tiles fly in as whole squares and are cut once they land, so nothing looks broken mid-move)
      var cp = t.c < 0.995 ? "path('" + pathStr(sh, T.geo, t.x + gap, t.y + gap) + "')" : '';
      if (moving) { f.style.clipPath = ''; clips.push([f, cp]); } else f.style.clipPath = cp;
      aim(f, w, w);
    });
    if (moving) { line.style.opacity = 0; back.style.opacity = 0; ct = setTimeout(function () { clips.forEach(function (c) { c[0].style.clipPath = c[1]; }); outline(sh, T.geo, W, H); }, RM ? 0 : 1900); }
    else outline(sh, T.geo, W, H);
  }

  function step() { if (!seen || hover) return; turn++; mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]; layout(); }
  function play() { clearInterval(timer); timer = setInterval(step, 7000); }
  g.addEventListener('pointerover', function (e) { hover = !!e.target.closest('figure'); });
  g.addEventListener('pointerleave', function () { hover = false; });
  function vis() { var r = g.getBoundingClientRect(), vh = window.innerHeight; seen = r.top < vh * 0.75 && r.bottom > vh * 0.25; }
  window.addEventListener('scroll', vis, { passive: true });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 140); });
  window.addEventListener('load', layout);
  g.classList.add('cg', 'cg-mos');
  layout(); vis(); play();
})();
