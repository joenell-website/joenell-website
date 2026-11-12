/* Portfolio "frames": the photo gallery arranges itself into a heart, two joined rings and a polaroid collage,
   then can be shown as a classic gallery. Tiles are the gallery's own buttons, so the lightbox and filters keep working. */
(function () {
  var g = document.querySelector('#pf-g .gallery'); if (!g) return;
  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var L = {
    en: ['Heart', 'Two rings', 'Collage', 'Gallery', 'Frame', 'Tap any photo to see it larger'],
    fr: ['Cœur', 'Deux alliances', 'Collage', 'Galerie', 'Cadre', 'Touchez une photo pour l’agrandir'],
    es: ['Corazón', 'Dos anillos', 'Collage', 'Galería', 'Marco', 'Toca una foto para verla en grande'],
    zh: ['爱心', '双环', '拼贴', '画廊', '相框', '点击任意照片查看大图'],
    pa: ['ਦਿਲ', 'ਦੋ ਮੁੰਦਰੀਆਂ', 'ਕੋਲਾਜ', 'ਗੈਲਰੀ', 'ਫ੍ਰੇਮ', 'ਵੱਡਾ ਦੇਖਣ ਲਈ ਕਿਸੇ ਵੀ ਫ਼ੋਟੋ ’ਤੇ ਟੈਪ ਕਰੋ']
  }[lang] || null;
  if (!L) L = ['Heart', 'Two rings', 'Collage', 'Gallery', 'Frame', 'Tap any photo to see it larger'];
  var MODES = ['heart', 'rings', 'collage', 'grid'];
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  // Controls under the category filters
  var bar = document.createElement('div'); bar.className = 'cg-bar';
  bar.innerHTML = '<span class="cg-lbl">' + L[4] + '</span><div class="cg-modes" role="group" aria-label="' + L[4] + '">' +
    MODES.map(function (m, i) { return '<button type="button" data-mode="' + m + '" aria-pressed="false"><i class="cg-ic cg-' + m + '" aria-hidden="true"></i>' + L[i] + '</button>'; }).join('') +
    '</div><span class="cg-tip">' + L[5] + '</span>';
  g.parentNode.insertBefore(bar, g);
  var amp = document.createElement('div'); amp.className = 'cg-amp'; amp.setAttribute('aria-hidden', 'true'); amp.textContent = '&';
  g.appendChild(amp);

  var mode = 'heart', auto = !RM, timer = null, seen = false, hover = false, turn = 0;
  function figs() { return [].slice.call(g.querySelectorAll(':scope > figure')).filter(function (f) { return !f.hidden; }); }
  function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }

  function place(f, x, y, w, h, rot, z, extra) {
    f.style.setProperty('--x', x.toFixed(1) + 'px'); f.style.setProperty('--y', y.toFixed(1) + 'px');
    f.style.setProperty('--w', Math.round(w) + 'px'); f.style.setProperty('--h', Math.round(h) + 'px');
    f.style.setProperty('--r', (rot || 0).toFixed(2) + 'deg'); f.style.zIndex = z || 1;
    f.className = f.className.replace(/\s*cg-(round|feat|pol)/g, '') + (extra ? ' ' + extra : '');
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
    g.classList.toggle('cg-on', mode !== 'grid');
    g.setAttribute('data-shape', mode);
    if (mode === 'grid') { g.style.height = ''; window.dispatchEvent(new Event('resize')); return; }
    var H = phone ? Math.round(W * (mode === 'collage' ? 2.3 : 1.18)) : Math.round(Math.min(Math.max(window.innerHeight * 0.84, 560), 820, W * 0.72));
    g.style.height = H + 'px';
    var cx = W / 2, cy = H / 2;
    if (mode === 'heart') {
      // Heart frame: photos along the outline, one featured photo in the middle.
      var feat = F[turn % n], ring = F.filter(function (f) { return f !== feat; }), m = ring.length;
      var sc = Math.min(W * (phone ? 0.86 : 0.62) / 32, H * 0.84 / 29), oy = cy - 2.5 * sc;
      var hp = along(function (t) { var s = Math.sin(t); return [cx + 16 * s * s * s * sc, oy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * sc]; }, m, 0.5);
      var tile = Math.max(phone ? 40 : 58, Math.min(sc * 5.4, hp.len / m * 1.12));
      ring.forEach(function (f, i) { var p = hp.pts[i]; place(f, p[0] - tile / 2, p[1] - tile / 2, tile, tile, (rnd(i, 1) - 0.5) * 12, 2 + (i % 3)); });
      var fw = sc * (phone ? 10.5 : 10);
      place(feat, cx - fw / 2, oy + 1.2 * sc - fw * 0.625, fw, fw * 1.25, (rnd(turn, 2) - 0.5) * 4, 6, 'cg-feat');
      amp.style.opacity = 0;
    } else if (mode === 'rings') {
      // Two joined rings: round photos on two interlocking circles.
      var R = Math.min(W * (phone ? 0.27 : 0.2), H * (phone ? 0.24 : 0.33)), dx = R * 0.62;
      var a = Math.ceil(n / 2), b = n - a;
      var c1 = along(function (t) { return [cx - dx + R * Math.cos(t), cy + R * Math.sin(t)]; }, a, 0.25);
      var c2 = along(function (t) { return [cx + dx + R * Math.cos(t), cy + R * Math.sin(t)]; }, Math.max(b, 1), 0.75);
      var tl = Math.max(phone ? 38 : 56, Math.min(phone ? 72 : 120, (2 * Math.PI * R) / Math.max(a, 1) * 0.98));
      F.forEach(function (f, i) {
        var left = i < a, p = left ? c1.pts[i] : c2.pts[i - a];
        // interlock: where the rings cross, the left ring passes over at the top and under at the bottom
        var z = 3; if (Math.abs(p[0] - cx) < R * 0.55) z = left ? (p[1] < cy ? 5 : 2) : (p[1] < cy ? 2 : 5);
        place(f, p[0] - tl / 2, p[1] - tl / 2, tl, tl, 0, z, 'cg-round');
      });
      amp.style.opacity = 1; amp.style.left = cx + 'px'; amp.style.top = cy + 'px'; amp.style.fontSize = Math.round(R * 0.7) + 'px';
    } else {
      // Polaroid collage: a loose, overlapping pile, every photo whole.
      var cols = phone ? 3 : Math.max(4, Math.round(Math.sqrt(n * W / H))), rows = Math.ceil(n / cols);
      var cw = W / cols, rh = H / rows;
      F.forEach(function (f, i) {
        var im = f.querySelector('img'), r = (+im.getAttribute('width') || 4) / (+im.getAttribute('height') || 5);
        var c = i % cols, rI = Math.floor(i / cols), base = phone ? Math.min(cw * 1.2, rh * 1.25) : Math.min(cw * 1.08, rh * 1.18);
        var w = r >= 1 ? base * 1.08 : base * 0.84, h = w / r + (phone ? 22 : 34);
        if (h > rh * 1.45) { h = rh * 1.45; w = (h - (phone ? 22 : 34)) * r; }
        var x = c * cw + cw / 2 - w / 2 + (rnd(i, 3) - 0.5) * cw * 0.35, y = rI * rh + rh / 2 - h / 2 + (rnd(i, 4) - 0.5) * rh * 0.3;
        x = Math.max(14, Math.min(W - w - 14, x)); y = Math.max(16, Math.min(H - h - 16, y));
        place(f, x, y, w, h, (rnd(i, 5) - 0.5) * 16, 2 + Math.floor(rnd(i, 6) * 6), 'cg-pol');
      });
      amp.style.opacity = 0;
    }
  }

  function setMode(m, byUser) {
    mode = m; if (byUser) auto = false;
    [].forEach.call(bar.querySelectorAll('[data-mode]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
    layout(); if (!auto) clearInterval(timer);
  }
  function step() { if (!seen || hover) return; turn++; var i = MODES.indexOf(mode); setMode(MODES[(i + 1) % 3]); }
  function play() { clearInterval(timer); if (auto && !RM) timer = setInterval(step, 7000); }

  bar.addEventListener('click', function (e) { var b = e.target.closest('[data-mode]'); if (b) setMode(b.getAttribute('data-mode'), true); });
  g.addEventListener('pointerover', function (e) { hover = !!e.target.closest('figure'); });
  g.addEventListener('pointerleave', function () { hover = false; });
  function vis() { var r = g.getBoundingClientRect(), vh = window.innerHeight; seen = r.top < vh * 0.75 && r.bottom > vh * 0.25; }
  window.addEventListener('scroll', vis, { passive: true });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); if (mode !== 'grid') rt = setTimeout(layout, 140); });
  document.querySelectorAll('[data-filter]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(layout, 30); }); });
  window.addEventListener('load', layout);
  g.classList.add('cg');
  setMode('heart'); vis(); play();
})();
