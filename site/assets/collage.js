/* Portfolio "frames": the photo gallery arranges itself into a heart, two joined rings and a polaroid collage,
   then can be shown as a classic gallery. Tiles are the gallery's own buttons, so the lightbox and filters keep working. */
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
  var MODES = ['heart', 'rings', 'collage'];
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  // Title above the frames (no frame labels: the shapes change on their own)
  var bar = document.createElement('div'); bar.className = 'cg-bar';
  bar.innerHTML = '<span class="cg-eb">' + L[0] + '</span><h2 class="cg-h">' + L[1] + '</h2><span class="cg-tip">' + L[2] + '</span>';
  var fl = g.parentNode.querySelector('.filters'); g.parentNode.insertBefore(bar, fl || g);
  var tip = bar.querySelector('.cg-tip'); g.parentNode.insertBefore(tip, g);
  var amp = document.createElement('div'); amp.className = 'cg-amp'; amp.setAttribute('aria-hidden', 'true'); amp.textContent = '&';
  g.appendChild(amp);
  var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'cg-line'); svg.setAttribute('aria-hidden', 'true');
  var pa = document.createElementNS(NS, 'path'), pb = document.createElementNS(NS, 'path'); svg.appendChild(pa); svg.appendChild(pb); g.appendChild(svg);
  function draw(paths, W, H) {
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
    [pa, pb].forEach(function (el, i) {
      var d = paths[i]; el.style.transition = 'none';
      if (!d) { el.setAttribute('d', ''); el.style.opacity = 0; return; }
      el.setAttribute('d', d); var L = el.getTotalLength ? el.getTotalLength() : 3000;
      el.style.strokeDasharray = L; el.style.strokeDashoffset = RM ? 0 : L; el.style.opacity = 1; el.getBoundingClientRect();
      el.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) ' + (0.15 + i * 0.25) + 's, opacity .6s'; el.style.strokeDashoffset = 0;
    });
  }
  function pathOf(fn, k) { var d = ''; for (var i = 0; i <= k; i++) { var p = fn(i / k * Math.PI * 2); d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); } return d + 'Z'; }

  var mode = 'heart', auto = true, timer = null, seen = false, hover = false, turn = 0;
  function figs() { return [].slice.call(g.querySelectorAll(':scope > figure')).filter(function (f) { return !f.hidden; }); }
  function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }

  function place(f, x, y, w, h, rot, z, extra) {
    f.style.setProperty('--x', x.toFixed(1) + 'px'); f.style.setProperty('--y', y.toFixed(1) + 'px');
    f.style.setProperty('--w', Math.round(w) + 'px'); f.style.setProperty('--h', Math.round(h) + 'px');
    f.style.setProperty('--r', (rot || 0).toFixed(2) + 'deg'); f.style.zIndex = z || 1;
    f.className = f.className.replace(/\s*cg-(round|feat|pol)/g, '') + (extra ? ' ' + extra : '');
    aim(f, w, h, extra);
  }
  // Tile size that shows the WHOLE photo: long side = L, the other side follows the photo's own shape (+ frame border).
  function dims(f, L, pad) {
    var im = f.querySelector('img'), r = (+im.getAttribute('width') || 4) / (+im.getAttribute('height') || 5), b = pad || 6;
    return r >= 1 ? [L, (L - b) / r + b] : [(L - b) * r + b, L];
  }
  // Keep the faces in every tile: crop around the photo's focus point (data-fx/fy) for the tile's exact shape.
  function aim(f, w, h, extra) {
    var im = f.querySelector('img'); if (!im) return;
    var r = (+im.getAttribute('width') || im.naturalWidth || 4) / (+im.getAttribute('height') || im.naturalHeight || 5);
    var fx = parseFloat(im.getAttribute('data-fx')), fy = parseFloat(im.getAttribute('data-fy'));
    if (isNaN(fx)) fx = 50; if (isNaN(fy)) fy = 35;
    var ph = window.innerWidth < 700, bw = w - (extra === 'cg-pol' ? (ph ? 10 : 16) : extra === 'cg-feat' ? 16 : 6), bh = h - (extra === 'cg-pol' ? (ph ? 23 : 34) : extra === 'cg-feat' ? 16 : 6);
    if (bw <= 0 || bh <= 0) return;
    var dw, dh; if (bw / bh > r) { dw = bw; dh = bw / r; } else { dh = bh; dw = bh * r; }
    var round = extra === 'cg-round', fyy = round ? 0.5 : 0.42; // round tiles: faces in the middle of the circle
    var ox = dw > bw + 1 ? Math.min(0, Math.max(bw - dw, bw * 0.5 - dw * fx / 100)) : 0;
    var oy = dh > bh + 1 ? Math.min(0, Math.max(bh - dh, bh * fyy - dh * fy / 100)) : 0;
    var px = dw > bw + 1 ? ox / (bw - dw) * 100 : 50, py = dh > bh + 1 ? oy / (bh - dh) * 100 : 50;
    im.style.setProperty('object-position', px.toFixed(1) + '% ' + py.toFixed(1) + '%', 'important');
  }

  // Evenly spaced points along a closed curve given by fn(t), t in [0, 2PI)
  function along(fn, n, off) {
    var S = 600, pts = [], len = [0], i;
    for (i = 0; i <= S; i++) pts.push(fn(i / S * Math.PI * 2));
    for (i = 1; i <= S; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var tot = len[S], out = [], j = 0;
    for (var k = 0; k < n; k++) {
      var d = ((k + (off || 0)) / n) * tot; while (j < S && len[j + 1] < d) j++;
      var a = (d - len[j]) / ((len[j + 1] - len[j]) || 1);
      out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * a, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * a]);
    }
    return { pts: out, len: tot };
  }

  function layout() {
    var W = g.clientWidth; if (!W) return;
    var F = figs(), n = F.length, phone = W < 700;
    g.classList.add('cg-on');
    g.setAttribute('data-shape', mode);
    var H = phone ? Math.round(mode === 'collage' ? Math.max(W * 0.9, Math.ceil(n / (n <= 4 ? 2 : 3)) * W / (n <= 4 ? 2 : 3) * 1.18 + 30) : W * 1.18) : Math.round(Math.min(Math.max(window.innerHeight * 0.84, 560), 820, W * 0.72));
    g.style.height = H + 'px';
    var cx = W / 2, cy = H / 2;
    if (mode === 'heart') {
      // Heart frame: photos along the outline, one featured photo in the middle.
      var feat = F[turn % n], ring = F.filter(function (f) { return f !== feat; }), m = ring.length;
      var sc = Math.min(W * (phone ? 0.86 : 0.62) / 32, H * 0.84 / 29), oy = cy - 2.5 * sc;
      var hf = function (t) { var s = Math.sin(t); return [cx + 16 * s * s * s * sc, oy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * sc]; };
      var hp = along(hf, Math.max(m, 1), 0.5); draw([pathOf(hf, 240)], W, H);
      // Whole photos (each tile keeps its photo's own shape); fewer photos = bigger photos.
      var cap = sc * (m <= 4 ? 9.5 : m <= 8 ? 7.4 : m <= 14 ? 6.2 : 5.6);
      var L = Math.max(phone ? 46 : 64, Math.min(cap, hp.len / Math.max(m, 1) * 1.08));
      ring.forEach(function (f, i) { var p = hp.pts[i], d = dims(f, L); place(f, p[0] - d[0] / 2, p[1] - d[1] / 2, d[0], d[1], (rnd(i, 1) - 0.5) * 10, 2 + (i % 3)); });
      var FL = sc * (m <= 8 ? 13 : 11.5), fd = dims(feat, FL, 16);
      place(feat, cx - fd[0] / 2, oy + 1.6 * sc - fd[1] / 2, fd[0], fd[1], (rnd(turn, 2) - 0.5) * 4, 6, 'cg-feat');
      amp.style.opacity = 0;
    } else if (mode === 'rings') {
      // Two joined rings: round photos on two interlocking circles.
      var R = Math.min(W * (phone ? 0.29 : 0.2), H * (phone ? 0.3 : 0.33)), dx = R * 0.62;
      var a = Math.ceil(n / 2), b = n - a;
      var f1 = function (t) { return [cx - dx + R * Math.cos(t), cy + R * Math.sin(t)]; }, f2 = function (t) { return [cx + dx + R * Math.cos(t), cy + R * Math.sin(t)]; };
      var c1 = along(f1, a, 0.25), c2 = along(f2, Math.max(b, 1), 0.75); draw([pathOf(f1, 180), pathOf(f2, 180)], W, H);
      if (a <= 4) { // few photos: keep them on the outer sides of each ring so they never pile up where the rings cross
        c1.pts = []; c2.pts = [];
        for (var k = 0; k < a; k++) c1.pts.push(f1(Math.PI * (0.45 + 1.1 * (k + 0.5) / a)));
        for (k = 0; k < b; k++) c2.pts.push(f2(Math.PI * (-0.55 + 1.1 * (k + 0.5) / b)));
      }
      var RL = Math.max(phone ? 46 : 62, Math.min(a <= 4 ? R * 0.92 : a <= 7 ? R * 0.7 : R * 0.58, a <= 4 ? R * Math.PI * 1.1 / a * 0.92 : (2 * Math.PI * R) / Math.max(a, 1) * 0.95));
      F.forEach(function (f, i) {
        var left = i < a, p = left ? c1.pts[i] : c2.pts[i - a], d = dims(f, RL);
        // interlock: where the rings cross, the left ring passes over at the top and under at the bottom
        var z = 3; if (Math.abs(p[0] - cx) < R * 0.55) z = left ? (p[1] < cy ? 5 : 2) : (p[1] < cy ? 2 : 5);
        place(f, Math.max(4, Math.min(W - d[0] - 4, p[0] - d[0] / 2)), Math.max(4, Math.min(H - d[1] - 4, p[1] - d[1] / 2)), d[0], d[1], 0, z, 'cg-round');
      });
      amp.style.opacity = 0;
    } else {
      // Polaroid collage: a loose, overlapping pile, every photo whole.
      draw([], W, H);
      var cols = phone ? (n <= 4 ? 2 : 3) : (n <= 4 ? n : n <= 8 ? Math.ceil(n / 2) : Math.max(4, Math.round(Math.sqrt(n * W / H)))), rows = Math.ceil(n / cols);
      var cw = W / cols, rh = H / rows;
      F.forEach(function (f, i) {
        var im = f.querySelector('img'), r = (+im.getAttribute('width') || 4) / (+im.getAttribute('height') || 5);
        var c = i % cols, rI = Math.floor(i / cols), base = phone ? Math.min(cw * 1.2, rh * 1.25) : Math.min(cw * 1.08, rh * 1.18);
        var PX = phone ? 10 : 16, PY = phone ? 23 : 34; // polaroid border: sides / top+bottom
        var w = r >= 1 ? base * 1.08 : base * 0.84, h = (w - PX) / r + PY;
        if (h > rh * 1.45) { h = rh * 1.45; w = (h - PY) * r + PX; }
        var x = c * cw + cw / 2 - w / 2 + (rnd(i, 3) - 0.5) * cw * 0.35, y = rI * rh + rh / 2 - h / 2 + (rnd(i, 4) - 0.5) * rh * 0.3;
        x = Math.max(14, Math.min(W - w - 14, x)); y = Math.max(16, Math.min(H - h - 16, y));
        place(f, x, y, w, h, (rnd(i, 5) - 0.5) * 16, 2 + Math.floor(rnd(i, 6) * 6), 'cg-pol');
      });
      amp.style.opacity = 0;
    }
  }

  function setMode(m) { mode = m; layout(); }
  // Every 7 s: next shape AND next category (All -> Weddings -> Engagements -> Couples), so the buttons change on their own too.
  var FB = [].slice.call(document.querySelectorAll('#pf-g [data-filter]')), auto2 = true;
  function step() {
    if (!seen || hover) return; turn++;
    var i = MODES.indexOf(mode); mode = MODES[(i + 1) % 3];
    var cur = FB.findIndex(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
    if (FB.length) { auto2 = true; FB[(cur + 1) % FB.length].click(); auto2 = false; } else layout();
  }
  function play() { clearInterval(timer); timer = setInterval(step, 7000); }
  FB.forEach(function (b) { b.addEventListener('click', function () { if (!auto2) play(); }); });

  g.addEventListener('pointerover', function (e) { hover = !!e.target.closest('figure'); });
  g.addEventListener('pointerleave', function () { hover = false; });
  function vis() { var r = g.getBoundingClientRect(), vh = window.innerHeight; seen = r.top < vh * 0.75 && r.bottom > vh * 0.25; }
  window.addEventListener('scroll', vis, { passive: true });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 140); });
  document.querySelectorAll('[data-filter]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(layout, 30); }); });
  window.addEventListener('load', layout);
  g.classList.add('cg');
  setMode('heart'); vis(); play();
})();
