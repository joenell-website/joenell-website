/* ---------- Enquiry source (first page of the visit: utm_*, gclid, referrer) ---------- */
(function () {
  try {
    if (sessionStorage.getItem('jp_src')) return;
    var q = new URLSearchParams(location.search), parts = [];
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid'].forEach(function (k) { if (q.get(k)) parts.push(k.replace('utm_', '') + '=' + q.get(k)); });
    var ref = document.referrer && document.referrer.indexOf(location.host) < 0 ? 'ref=' + document.referrer.split('?')[0] : '';
    if (ref) parts.push(ref);
    parts.push('landing=' + location.pathname);
    sessionStorage.setItem('jp_src', parts.join(' '));
  } catch (err) {}
})();

(function () {
  var I18N = window.I18N || {}; function T(k) { return I18N[k] || k; }
  'use strict';
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: border on scroll + mobile menu
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    var btn = header.querySelector('.menu-btn'), nav = header.querySelector('.nav');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
      });
    }
  }

  // Footer year
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Reveal on scroll
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('in'); }); }

  // Focus-point cropping: keep each photo's subject (faces) in frame for any box shape.
  function fit(img) {
    var fx = parseFloat(img.getAttribute('data-fx')), fy = parseFloat(img.getAttribute('data-fy'));
    if (isNaN(fx) || !img.naturalWidth) return;
    var zoom = parseFloat(img.getAttribute('data-zoom'));
    if (zoom) { // lens glass: zoom in and centre the subject inside the round frame
      var box = img.parentElement, bw = box.clientWidth, bh = box.clientHeight; if (!bw) return;
      // Subject first: zoom just enough (up to 2.6x) that the faces can sit near the centre of the round glass.
      var base = Math.max(bw / img.naturalWidth, bh / img.naturalHeight), fw = img.naturalWidth * base / bw, fh = img.naturalHeight * base / bh;
      // Whole couple, no extra zoom: centre them left-right; top-to-bottom keep as much of the bodies (feet included)
      // as possible while the faces stay clear of the top of the round glass.
      var z = base * 1.02, zw = img.naturalWidth * z, zh = img.naturalHeight * z;
      var lx = Math.min(0, Math.max(bw - zw, bw * 0.5 - zw * fx / 100));
      var ly = bh - zh, faceY = (zh * fy / 100 + ly) / bh;
      if (faceY < 0.24) ly = Math.min(0, bh * 0.24 - zh * fy / 100);
      // percentages, so the photo still fills the glass when the lens (and glass) changes size
      img.style.width = (zw / bw * 100) + '%'; img.style.height = (zh / bh * 100) + '%'; img.style.left = (lx / bw * 100) + '%'; img.style.top = (ly / bh * 100) + '%';
      return;
    }
    var cs = getComputedStyle(img); if (cs.objectFit !== 'cover') return;
    var cw = img.clientWidth, ch = img.clientHeight; if (!cw || !ch) return;
    var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight), dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    var ox = dw > cw + 1 ? Math.min(0, Math.max(cw - dw, cw * 0.5 - dw * fx / 100)) : 0;
    var oy = dh > ch + 1 ? Math.min(0, Math.max(ch - dh, ch * 0.42 - dh * fy / 100)) : 0;
    var px = dw > cw + 1 ? (ox / (cw - dw) * 100) : 50, py = dh > ch + 1 ? (oy / (ch - dh) * 100) : 50;
    img.style.objectPosition = px.toFixed(1) + '% ' + py.toFixed(1) + '%';
  }
  window.__fit = fit;
  function fitAll() { document.querySelectorAll('img[data-fx]').forEach(fit); }
  document.querySelectorAll('img[data-fx]').forEach(function (im) {
    if (im.complete) fit(im); im.addEventListener('load', function () { fit(im); });
  });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fitAll, 120); });

  // Camera hero: the lens shoots on its own — iris closes, focus ring turns, a new photo appears, iris opens.
  var cam = document.querySelector('[data-camera]');
  if (cam) {
    var lenses = Array.prototype.slice.call(document.querySelectorAll('.lens'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.panel[data-i]'));
    var layers = Array.prototype.slice.call(cam.querySelectorAll('.glass .shot'));
    var blades = Array.prototype.slice.call(cam.querySelectorAll('.blade'));
    var barrel = cam.querySelector('.barrel'), knurl = cam.querySelector('.knurl'), af = cam.querySelector('.af');
    var info = document.querySelector('[data-lens-info]');
    var frameEl = cam.querySelector('[data-frame]');
    var playBtn = document.querySelector('[data-play]');
    var data = JSON.parse(document.getElementById('lens-data').textContent);
    var list = JSON.parse(document.getElementById('lens-playlist').textContent);
    var sel = list[0].lens, at = 0, front = 0, turn = 0, frame = 23, busy = false, timer = null;
    var playing = true, visible = true, DELAY = 3400;

    function iris(open) {
      blades.forEach(function (b, i) {
        b.style.transform = 'rotate(' + (i * 45 + (open ? 0 : 18)) + 'deg) translateY(' + (open ? '-58%' : '0%') + ')';
      });
    }
    function paintLens() {
      var d = data[sel];
      barrel.style.width = d.size + '%';
      cam.querySelector('[data-mm]').textContent = d.mm;
      cam.querySelector('[data-fnum]').textContent = d.fnum;
      cam.querySelector('[data-engrave]').textContent = d.engrave;
      cam.querySelector('[data-filter]').textContent = 'ø' + d.filter + ' · MULTI-COATED';
      lenses.forEach(function (l, i) { l.setAttribute('aria-pressed', i === sel ? 'true' : 'false'); });
      if (!document.querySelector('.panels.auto-focus')) panels.forEach(function (p) { p.classList.toggle('on', +p.dataset.i === sel); });
      if (info) {
        info.querySelector('[data-k="focal"]').textContent = d.focal + ' · ' + d.cat;
        info.querySelector('[data-k="exp"]').textContent = d.exposure;
        info.querySelector('[data-k="line"]').textContent = d.line;
        info.querySelector('[data-k="price"]').textContent = d.price;
        var a = info.querySelector('[data-k="go"]'); a.href = d.href; a.querySelector('span').textContent = T('Explore') + ' ' + d.cat;
      }
      var fl = document.querySelector('[data-infocus]'); if (fl) fl.textContent = T('In focus:') + ' ' + d.cat;
    }
    function label() { cam.setAttribute('aria-label', T('Camera with a {mm}mm lens showing:').replace('{mm}', data[sel].mm) + ' ' + list[at].alt); }
    function shoot() {
      frame += 1; frameEl.textContent = String(frame).padStart(3, '0');
      if (!reduce) { af.classList.remove('go'); barrel.classList.remove('flash'); void af.offsetWidth; af.classList.add('go'); barrel.classList.add('flash'); var kb = cam.querySelector('.knob'); if (kb) { kb.classList.add('press'); setTimeout(function () { kb.classList.remove('press'); }, 160); } }
    }
    function load(i, cb) {
      var back = layers[1 - front], it = list[i];
      back.setAttribute('data-fx', it.fx); back.setAttribute('data-fy', it.fy); back.setAttribute('data-zmax', it.zmax || 2.6);
      var done = function () { back.onload = back.onerror = null; fit(back); cb(); };
      if (back.getAttribute('src') === it.src && back.complete) return done();
      back.onload = done; back.onerror = done; back.src = it.src;
    }
    function preload(i) { var p = new Image(); p.src = list[i % list.length].src; }
    function show(i) {
      if (busy) return; busy = true;
      i = (i + list.length) % list.length;
      load(i, function () {
        var lensChange = list[i].lens !== sel;
        if (!reduce) { iris(false); turn += 1; knurl.style.transform = 'rotate(' + (turn * (lensChange ? 120 : 40)) + 'deg)'; }
        setTimeout(function () {
          layers[front].classList.remove('on'); front = 1 - front; layers[front].classList.add('on');
          var vf = cam.querySelector('[data-vf]'); if (vf) { vf.style.opacity = 0; setTimeout(function () { vf.src = list[i].src.replace(/\.jpg(\?|$)/, '-sm.jpg$1'); vf.style.objectPosition = list[i].fx + '% ' + list[i].fy + '%'; vf.style.opacity = 1; }, 200); }
          at = i; sel = list[i].lens; if (lensChange) paintLens(); label();
        }, reduce ? 0 : 360);
        setTimeout(function () { iris(true); shoot(); busy = false; preload(i + 1); schedule(); }, reduce ? 0 : 560);
      });
    }
    function schedule() {
      clearTimeout(timer);
      if (playing && visible && !document.hidden) timer = setTimeout(function () { show(at + 1); }, DELAY);
    }
    function setPlaying(p) {
      playing = p;
      if (playBtn) { playBtn.setAttribute('aria-pressed', p ? 'false' : 'true'); playBtn.querySelector('.lbl').textContent = p ? T('Pause slideshow') : T('Play slideshow'); playBtn.classList.toggle('paused', !p); }
      schedule();
    }
    // Picking a lens jumps to that lens's next photo; the slideshow carries on from there.
    function pickLens(c) {
      for (var k = 1; k <= list.length; k++) { var j = (at + k) % list.length; if (list[j].lens === c) { clearTimeout(timer); show(j); return; } }
    }
    lenses.forEach(function (l, i) {
      l.addEventListener('click', function () { pickLens(i); });
      l.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!n) return; e.preventDefault();
        var j = (i + n + lenses.length) % lenses.length; lenses[j].focus(); pickLens(j);
      });
    });
    panels.forEach(function (p) {
      var i = +p.dataset.i;
      p.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches && i !== sel) pickLens(i); });
    });
    if (playBtn) playBtn.addEventListener('click', function () { setPlaying(!playing); });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }).observe(cam);
    }
    fit(layers[0]); layers[0].addEventListener('load', function () { fit(layers[0]); });
    iris(false); paintLens(); label(); setPlaying(playing); preload(1);
    setTimeout(function () { iris(true); shoot(); }, reduce ? 0 : 650);
  }

  // Portfolio filters
  var filters = document.querySelectorAll('[data-filter]');
  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('.gallery figure').forEach(function (fig) {
        fig.hidden = !(f === 'all' || fig.getAttribute('data-cat') === f);
      });
    });
  });

  // Lightbox
  var box = document.querySelector('.lightbox');
  if (box && typeof box.showModal === 'function') {
    var img = box.querySelector('img'), list = [], at = 0, opener = null;
    function show(i) {
      at = (i + list.length) % list.length;
      var b = list[at];
      img.src = b.getAttribute('data-full'); img.alt = b.querySelector('img').alt;
    }
    document.querySelectorAll('.gallery button').forEach(function (b) {
      b.addEventListener('click', function () {
        list = Array.prototype.filter.call(document.querySelectorAll('.gallery button'), function (x) { return !x.closest('figure').hidden; });
        opener = b; show(list.indexOf(b)); box.showModal();
      });
    });
    box.querySelector('.x').addEventListener('click', function () { box.close(); });
    box.querySelector('.prev').addEventListener('click', function () { show(at - 1); });
    box.querySelector('.next').addEventListener('click', function () { show(at + 1); });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('in')) box.close(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); });
    box.addEventListener('close', function () { if (opener) opener.focus(); });
  } else {
    document.querySelectorAll('.gallery button').forEach(function (b) {
      b.addEventListener('click', function () { window.open(b.getAttribute('data-full'), '_blank'); });
    });
  }

  // Contact form -> sends straight to the "Website enquiries" Google Form (owner gets an email per enquiry).
  // Falls back to the visitor's email app only if the network request fails.
  var form = document.getElementById('inquiry');
  if (form) {
    var GFORM = 'https://docs.google.com/forms/d/e/1FAIpQLScDnPZKwu9lXSDtGiTnlC4ZxJ9fFU4kLeIOZdsALPj4ASg3Sw/formResponse';
    var MAP = { name: 'entry.554125004', email: 'entry.1027973329', phone: 'entry.452551025', type: 'entry.1799884964',
      date: 'entry.595071326', venue: 'entry.1775052562', message: 'entry.461589708', heard: 'entry.1457663904' };
    var SOURCE = 'entry.2020717134';
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    var SENDING = { en: 'Sending…', fr: 'Envoi…', es: 'Enviando…', zh: '发送中…', pa: 'ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…' }[lang] || 'Sending…';
    var t = new URLSearchParams(location.search).get('type');
    if (t) { Array.prototype.forEach.call(form.type.options, function (o) { if (o.value.toLowerCase() === t.toLowerCase()) form.type.value = o.value; }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var v = function (n) { return (form[n] && form[n].value || '').trim(); };
      var btn = form.querySelector('button[type=submit]');
      var label = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.textContent = SENDING; }
      var src = '';
      try { src = sessionStorage.getItem('jp_src') || ''; } catch (err) {}
      var data = new URLSearchParams();
      Object.keys(MAP).forEach(function (k) { data.append(MAP[k], v(k)); });
      data.append(SOURCE, (location.pathname + (src ? ' | ' + src : '')).slice(0, 480));
      var done = function () {
        var thanks = document.getElementById('thanks');
        form.hidden = true;
        if (thanks) { thanks.hidden = false; thanks.focus(); }
        // Conversion event for Google Analytics / Google Ads (no-op until the Google tag is on the page)
        try {
          window.dataLayer = window.dataLayer || [];
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', { form_id: 'inquiry', session_type: v('type'), currency: 'CAD' });
            if (window.JP_ADS_SEND_TO) window.gtag('event', 'conversion', { send_to: window.JP_ADS_SEND_TO });
          } else { window.dataLayer.push({ event: 'generate_lead', form_id: 'inquiry', session_type: v('type') }); }
        } catch (err) {}
      };
      fetch(GFORM, { method: 'POST', mode: 'no-cors', body: data }).then(done, function () {
        // Network failure: fall back to the visitor's email app so the enquiry is never lost
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        var body = ['Name: ' + v('name'), 'Email: ' + v('email'), 'Phone: ' + v('phone'), 'Session: ' + v('type'),
          'Date: ' + v('date'), 'Location / venue: ' + v('venue'), 'How you heard about me: ' + v('heard'), '', v('message')].join('\n');
        location.href = 'mailto:wedding@joenellphotography.ca?subject=' + encodeURIComponent(v('type') + ' inquiry from ' + v('name')) +
          '&body=' + encodeURIComponent(body);
      });
    });
  }
})();

/* ---------- Journal interactions ---------- */
(function () {
  'use strict';
  // Search + topic filter on /blog
  var grid = document.querySelector('.blog-grid');
  var search = document.getElementById('blog-search');
  var btns = document.querySelectorAll('[data-blog-filter]');
  if (grid && (search || btns.length)) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
    var count = document.getElementById('blog-count'), empty = document.getElementById('blog-empty');
    var topic = 'all';
    var apply = function () {
      var q = (search && search.value || '').trim().toLowerCase(), n = 0;
      cards.forEach(function (c) {
        var okT = topic === 'all' || (c.getAttribute('data-cats') || '').split('|').indexOf(topic) > -1;
        var okQ = !q || q.split(/\s+/).every(function (w) { return (c.getAttribute('data-text') || '').indexOf(w) > -1; });
        c.hidden = !(okT && okQ); if (!c.hidden) { n++; c.classList.add('in'); }
      });
      if (count) count.textContent = n + (n === 1 ? ' guide' : ' guides') + (topic !== 'all' ? ' in ' + topic : '') + (q ? ' matching “' + q + '”' : '');
      if (empty) empty.hidden = n > 0;
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        topic = b.getAttribute('data-blog-filter');
        btns.forEach(function (x) { var on = x === b; x.setAttribute('aria-pressed', on ? 'true' : 'false'); x.classList.toggle('on', on); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
  }

  // Reading progress bar
  var bar = document.querySelector('.progress span'), art = document.querySelector('article.post');
  if (bar && art) {
    var upd = function () {
      var r = art.getBoundingClientRect(), total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.transform = 'scaleX(' + p + ')';
    };
    upd(); window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd);
  }

  // Table of contents: highlight the section you're reading; collapse on phones
  var toc = document.querySelector('.toc');
  if (toc) {
    var det = toc.querySelector('details');
    if (det && window.matchMedia('(max-width:960px)').matches) det.removeAttribute('open');
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    var heads = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var spy = function () {
      var cur = heads[0];
      heads.forEach(function (h) { if (h.getBoundingClientRect().top < 140) cur = h; });
      links.forEach(function (a) { a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id); });
    };
    spy(); window.addEventListener('scroll', spy, { passive: true });
    links.forEach(function (a) { a.addEventListener('click', function () { if (det && window.matchMedia('(max-width:960px)').matches) det.removeAttribute('open'); }); });
  }

  // Copy link
  var cp = document.querySelector('[data-copy]');
  if (cp) cp.addEventListener('click', function () {
    var done = function () { cp.textContent = 'Link copied ✓'; cp.classList.add('done'); setTimeout(function () { cp.textContent = 'Copy link'; cp.classList.remove('done'); }, 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
  });

  // Related guides slider
  var track = document.querySelector('.rel-track');
  document.querySelectorAll('[data-rel]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!track) return;
      var card = track.firstElementChild, step = card ? card.getBoundingClientRect().width + 22 : 300;
      track.scrollBy({ left: step * Number(b.getAttribute('data-rel')), behavior: 'smooth' });
    });
  });
  /* auto-advance one guide every 5s; pauses on hover, focus, touch, offscreen or reduced motion */
  if (track && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var relHold = 0, relVis = false;
    var hold = function (ms) { relHold = Date.now() + ms; };
    ['pointerenter', 'focusin', 'touchstart', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { hold(12000); }, { passive: true }); });
    document.querySelectorAll('[data-rel]').forEach(function (b) { b.addEventListener('click', function () { hold(12000); }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { relVis = es[0].isIntersecting; }).observe(track); else relVis = true;
    setInterval(function () {
      if (!relVis || document.hidden || Date.now() < relHold || track.matches(':hover')) return;
      var card = track.firstElementChild, step = card ? card.getBoundingClientRect().width + 22 : 300;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) track.scrollTo({ left: 0, behavior: 'smooth' }); else track.scrollBy({ left: step, behavior: 'smooth' });
    }, 5000);
  }
})();

/* ---------- Weddings hero: light table ---------- */
(function () {
  'use strict';
  var lt = document.querySelector('[data-lighttable]'); if (!lt) return;
  var tabs = Array.prototype.slice.call(lt.querySelectorAll('.lt-tab'));
  var sets = Array.prototype.slice.call(lt.querySelectorAll('.lt-set'));
  var loupe = lt.querySelector('.lt-loupe'), limg = loupe.querySelector('img'), cap = lt.querySelector('[data-lt-caption]');
  var tbl = lt.querySelector('.lt-table'), rim = loupe.querySelector('.rim');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = null, active = null, curSrc = '';
  function ratioOf() { return (tbl.clientWidth / tbl.clientHeight) || 640 / 600; }
  function swapImg(slide) {
    var src = slide.getAttribute('data-src'); if (src === curSrc) return; curSrc = src;
    limg.style.opacity = 0;
    setTimeout(function () { limg.src = src; limg.style.opacity = 1; }, 180);
  }
  limg.addEventListener('load', function () { if (active) setGlass(active, cur ? cur.ox : 0, cur ? cur.oy : 0, (performance.now() - t0) / 1000); });
  function anchor(slide, t) {
    var w = parseFloat(slide.style.width), x = parseFloat(slide.style.left), y = parseFloat(slide.style.top), r = ratioOf();
    /* slow, layered sine drift = liquid wander across the frame */
    var ox = reduce ? 0 : w * (0.20 * Math.sin(t * 0.55) + 0.06 * Math.sin(t * 1.37 + 1.2));
    var oy = reduce ? 0 : w * r * (0.17 * Math.cos(t * 0.43) + 0.05 * Math.sin(t * 1.11 + 0.4));
    return { x: x + w * 0.56 + ox, y: y + w * r * 0.56 + oy, ox: ox / w, oy: oy / (w * r), r: r };
  }
  function place(p) {
    var h = 27 * p.r, l = Math.max(1, Math.min(72, p.x - 13.5)), tp = Math.max(3, Math.min(98 - h, p.y - h / 2));
    loupe.style.left = l + '%'; loupe.style.top = tp + '%';
  }
  function moveLoupe(slide) {
    active = slide; swapImg(slide);
    if (reduce || !cur) { cur = anchor(slide, 0); place(cur); setGlass(slide, 0, 0, 0); }
  }
  function setGlass(slide, ox, oy, t) {
    /* true magnifier: keep the subject (faces) centred, drift gently around it */
    var fx = +slide.getAttribute('data-fx'), fy = +slide.getAttribute('data-fy');
    var g = limg.parentElement.clientWidth, nw = limg.naturalWidth, nh = limg.naturalHeight;
    if (g && nw) {
      var zc = Math.max(1.12, Math.min(1.7, parseFloat(slide.getAttribute('data-zmax')) || 1.7)), Z = zc + 0.04 * Math.sin(t * 0.9), s = Math.max(g / nw, g / nh) * Z, dw = nw * s, dh = nh * s;
      var tx = fx + ox * 16, ty = fy + oy * 12;
      var l = Math.min(0, Math.max(g - dw, g * 0.5 - dw * tx / 100)), tp = Math.min(0, Math.max(g - dh, g * 0.46 - dh * ty / 100));
      limg.style.width = dw + 'px'; limg.style.height = dh + 'px'; limg.style.left = l + 'px'; limg.style.top = tp + 'px';
    }
    if (rim) rim.style.background = 'conic-gradient(from ' + (30 + t * 14 % 360).toFixed(1) + 'deg,#2a2927,#4b4844,#1b1a19,#3d3b37,#2a2927)';
  }
  /* autonomous motion: glide (eased) + wander; hop to the next frame every few seconds */
  var TAB_MS = 5500, HOP_MS = 2700;
  var hover = false, focusIn = false, visible = true, last = 0, t0 = performance.now(), hopAt = t0 + HOP_MS, tabAt = t0 + TAB_MS;
  lt.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
  lt.addEventListener('pointerleave', function () { hover = false; var n = performance.now(); hopAt = n + 2000; tabAt = Math.max(tabAt, n + 3500); });
  lt.addEventListener('focusin', function () { focusIn = true; });
  lt.addEventListener('focusout', function () { focusIn = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(lt);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!active || !visible || document.hidden) { last = now; return; }
    var dt = Math.min(64, now - (last || now)); last = now;
    var t = (now - t0) / 1000, tg = anchor(active, t), k = 1 - Math.pow(1 - 0.045, dt / 16.7);
    if (!cur) cur = tg;
    cur = { x: cur.x + (tg.x - cur.x) * k, y: cur.y + (tg.y - cur.y) * k, ox: cur.ox + (tg.ox - cur.ox) * k, oy: cur.oy + (tg.oy - cur.oy) * k, r: tg.r };
    place(cur); setGlass(active, cur.ox, cur.oy, t);
    if (!hover && !focusIn && tabs.length > 1 && now > tabAt) {
      tabAt = now + TAB_MS; hopAt = now + HOP_MS;
      var ci = 0; tabs.forEach(function (t, i) { if (t.getAttribute('aria-selected') === 'true') ci = i; });
      show(tabs[(ci + 1) % tabs.length].getAttribute('data-mix'));
    } else if (!hover && now > hopAt) {
      hopAt = now + HOP_MS;
      var set = active.closest('.lt-set'), all = Array.prototype.slice.call(set.querySelectorAll('.lt-slide'));
      pick(set, all[(all.indexOf(active) + 1) % all.length]);
    }
  }
  if (!reduce) { loupe.style.transition = 'none'; requestAnimationFrame(frame); }
  function pick(set, slide) {
    set.querySelectorAll('.lt-slide').forEach(function (s, i) {
      var on = s === slide; s.classList.toggle('on', on); s.setAttribute('aria-pressed', on ? 'true' : 'false');
      s.style.zIndex = on ? 6 : 1 + i;
    });
    moveLoupe(slide);
  }
  sets.forEach(function (set) {
    set.querySelectorAll('.lt-slide').forEach(function (s) { s.addEventListener('click', function () { pick(set, s); hopAt = performance.now() + 9000; tabAt = performance.now() + 12000; }); });
  });
  function show(k, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-mix') === k; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (on) { if (cap) cap.textContent = t.getAttribute('data-caption'); if (focus) t.focus(); }
    });
    sets.forEach(function (s) {
      var on = s.getAttribute('data-mix') === k; s.hidden = !on;
      if (on) {
        s.classList.remove('enter'); void s.offsetWidth; s.classList.add('enter');
        s.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; if (window.__fit) { if (im.complete) window.__fit(im); im.addEventListener('load', function () { window.__fit(im); }, { once: true }); } });
        pick(s, s.querySelector('.lt-slide.on') || s.querySelector('.lt-slide'));
      }
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('data-mix')); var n = performance.now(); tabAt = n + 12000; hopAt = n + HOP_MS; });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!n) return; e.preventDefault();
      show(tabs[(i + n + tabs.length) % tabs.length].getAttribute('data-mix'), true);
    });
  });
  var first = sets[0]; if (first) { var on = first.querySelector('.lt-slide.on'); if (on) moveLoupe(on); }
  window.addEventListener('resize', function () { var s = sets.filter(function (x) { return !x.hidden; })[0]; if (s) moveLoupe(s.querySelector('.lt-slide.on')); });
})();

/* ---------- Image protection: no right-click save, no drag, no long-press save ---------- */
(function () {
  'use strict';
  function isPhoto(t) { return t && t.closest && t.closest('img, .lt-slide, .glass, .vf, .gallery figure, .lightbox, .ph'); }
  document.addEventListener('contextmenu', function (e) { if (isPhoto(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  document.querySelectorAll('img').forEach(function (i) { i.setAttribute('draggable', 'false'); });

  // ---- Premium touches ----
  var reduceM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  // 1. Focus pull: the "Three ways" cards rack focus on their own while they're on screen.
  (function () {
    var wrap = document.querySelector('.panels'); if (!wrap || reduceM) return;
    var ps = Array.prototype.slice.call(wrap.querySelectorAll('.panel'));
    if (ps.length < 2) return;
    var k = Math.max(0, ps.findIndex(function (p) { return p.classList.contains('on'); })), t = null, inView = false, hold = false;
    function focus(i) { k = i; ps.forEach(function (p, j) { p.classList.toggle('on', j === i); }); }
    function tick() { clearTimeout(t); if (inView && !hold && !document.hidden) t = setTimeout(function () { focus((k + 1) % ps.length); tick(); }, 3200); }
    ps.forEach(function (p, j) {
      p.addEventListener('mouseenter', function () { hold = true; clearTimeout(t); focus(j); });
      p.addEventListener('mouseleave', function () { hold = false; tick(); });
      p.addEventListener('focusin', function () { hold = true; clearTimeout(t); focus(j); });
      p.addEventListener('focusout', function () { hold = false; tick(); });
    });
    var stacked = window.matchMedia('(max-width:900px)');
    function byScroll() {
      if (!stacked.matches) return;
      var mid = window.innerHeight / 2, best = 0, bd = 1e9;
      ps.forEach(function (p, j) { var r = p.getBoundingClientRect(), d = Math.abs(r.top + r.height * 0.4 - mid); if (d < bd) { bd = d; best = j; } });
      if (best !== k) focus(best);
    }
    window.addEventListener('scroll', function () { if (stacked.matches) requestAnimationFrame(byScroll); }, { passive: true });
    document.addEventListener('visibilitychange', tick);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting && !stacked.matches; tick(); byScroll(); }, { threshold: [0, 0.35] }).observe(wrap);
    wrap.classList.add('auto-focus');
  })();

  // 2. Photos "develop" as they scroll into view — soft and muted, then sharp and full colour.
  (function () {
    if (reduceM || !('IntersectionObserver' in window)) return;
    var sel = '.card .ph img, .gallery img, .split .ph img, .strip img, .post-body img, .lt-stage img';
    var imgs = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (im) { return im.getBoundingClientRect().top > window.innerHeight; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dev-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    imgs.forEach(function (im) { im.classList.add('dev'); io.observe(im); });
  })();

  // 3. Viewfinder cursor over photos (desktop only).
  (function () {
    if (!fine || reduceM) return;
    var vf = document.createElement('div'); vf.className = 'vf-cursor'; vf.setAttribute('aria-hidden', 'true');
    vf.innerHTML = '<i></i><i></i><i></i><i></i><b></b>'; document.body.appendChild(vf);
    var x = 0, y = 0, cx = 0, cy = 0, raf = null;
    function loop() { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; vf.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; raf = (Math.abs(x - cx) + Math.abs(y - cy) > 0.3) ? requestAnimationFrame(loop) : null; }
    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop);
      var on = !!(e.target.closest && e.target.closest('.ph, .gallery figure, .lt-stage, .split .ph, .strip a, .strip figure') && !e.target.closest('.tag'));
      vf.classList.toggle('show', on); document.documentElement.classList.toggle('vf-on', on);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { vf.classList.remove('show'); document.documentElement.classList.remove('vf-on'); });
  })();

  // 4. "Moments, not poses" — a moving walkway of photos. Drag/swipe to browse; pauses on hover;
  //    the photo passing the centre comes forward into focus.
  (function () {
    var box = document.querySelector('[data-escalator]'); if (!box) return;
    var track = box.querySelector('.track'); if (!track) return;
    var orig = Array.prototype.slice.call(track.children);
    if (reduceM) { box.classList.add('esc-static'); return; }
    orig.forEach(function (a) { var c = a.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.appendChild(c); });
    orig.forEach(function (a) { var c = a.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.appendChild(c); });
    var cards = Array.prototype.slice.call(track.children);
    cards.forEach(function (c) { var im = c.querySelector('img'); if (im) { im.removeAttribute('loading'); im.classList.remove('dev'); im.setAttribute('draggable', 'false'); } });
    var x = 0, v = 0, SPEED = 38, target = SPEED, last = 0, loopW = 0, drag = null, moved = 0, inView = true, hover = false;
    function measure() { loopW = cards[orig.length].offsetLeft - cards[0].offsetLeft; }
    function paint() {
      var bw = box.clientWidth, mid = bw / 2;
      cards.forEach(function (c) {
        var r = c.offsetLeft + x + c.offsetWidth / 2, d = Math.min(1, Math.abs(r - mid) / (bw * 0.55));
        var k = 1 - d * d;
        c.style.transform = 'translateY(' + (d * 14).toFixed(1) + 'px) scale(' + (0.9 + 0.12 * k).toFixed(3) + ')';
        c.style.filter = 'saturate(' + (0.72 + 0.28 * k).toFixed(2) + ') brightness(' + (0.94 + 0.06 * k).toFixed(2) + ')';
        c.style.zIndex = Math.round(k * 10);
      });
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    }
    function wrap() { if (!loopW) return; while (x <= -loopW) x += loopW; while (x > 0) x -= loopW; }
    function frame(t) {
      var dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!drag) {
        var goal = (hover || !inView || document.hidden) ? 0 : target;
        v += (goal - v) * Math.min(1, dt * 3);
        if (!goal && Math.abs(v) < 0.6) v = 0;
        x -= v * dt;
      }
      wrap(); paint();
      requestAnimationFrame(frame);
    }
    box.addEventListener('mouseenter', function () { hover = true; });
    box.addEventListener('mouseleave', function () { hover = false; });
    box.addEventListener('pointerdown', function (e) {
      drag = { x0: e.clientX, y0: e.clientY, sx: x, t: performance.now(), lx: e.clientX, vx: 0, id: e.pointerId, axis: null }; moved = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; if (drag.axis === 'x') { box.setPointerCapture && box.setPointerCapture(e.pointerId); box.classList.add('grabbing'); } }
      if (drag.axis !== 'x') return;
      var now = performance.now(); drag.vx = (e.clientX - drag.lx) / Math.max(1, now - drag.t) * 1000; drag.lx = e.clientX; drag.t = now;
      x = drag.sx + dx; moved = Math.abs(dx);
    });
    function end(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      if (drag.axis === 'x') { v = -Math.max(-1600, Math.min(1600, drag.vx)); }
      drag = null; box.classList.remove('grabbing');
    }
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    box.addEventListener('click', function (e) { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);
    box.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); x -= e.deltaX; } }, { passive: false });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(box);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure(); box.classList.add('esc-on'); requestAnimationFrame(frame);
  })();

  // 5. Galleries: justified rows. Every photo is shown whole (no cropping); each row has one height and ends flush.
  (function () {
    var gals = Array.prototype.slice.call(document.querySelectorAll('.gallery'));
    if (!gals.length) return;
    function ratio(f) { var im = f.querySelector('img'); var w = +im.getAttribute('width') || im.naturalWidth || 4, h = +im.getAttribute('height') || im.naturalHeight || 5; return w / h; }
    function layout() {
      gals.forEach(function (g) {
        var W = g.clientWidth; if (!W) return;
        var gap = W < 700 ? 10 : 14, target = W < 700 ? 190 : (W < 1100 ? 260 : 320);
        var figs = Array.prototype.slice.call(g.querySelectorAll(':scope > figure')).filter(function (f) { return !f.hidden; });
        var rows = [], row = [], sum = 0;
        figs.forEach(function (f) {
          var r = ratio(f); row.push([f, r]); sum += r;
          if (sum * target + gap * (row.length - 1) >= W) { rows.push(row); row = []; sum = 0; }
        });
        if (row.length) { if (rows.length && row.length === 1) rows[rows.length - 1] = rows[rows.length - 1].concat(row); else rows.push(row); }
        rows.forEach(function (rw) {
          var tot = rw.reduce(function (a, x) { return a + x[1]; }, 0), h = (W - gap * (rw.length - 1)) / tot, used = 0;
          rw.forEach(function (x, i) {
            var w = i === rw.length - 1 ? W - gap * (rw.length - 1) - used : Math.floor(x[1] * h); used += w;
            x[0].style.width = w + 'px'; x[0].style.height = Math.round(h) + 'px';
          });
        });
      });
    }
    layout();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(layout, 120); });
    window.addEventListener('load', layout);
    document.querySelectorAll('[data-filter]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(layout, 0); }); });
  })();

  // 6. Language: remember the visitor's choice, and offer a translation that matches the device language.
  (function () {
    var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
    var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
    document.querySelectorAll('[data-lang-link]').forEach(function (a) { a.addEventListener('click', function () { set('jp-lang', a.getAttribute('hreflang')); }); });
    var here = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
    if (here !== 'en' || get('jp-lang') || get('jp-lang-dismiss')) return;
    var P = { fr: ['Voir ce site en français ?', 'Oui', 'Non merci'], es: ['¿Ver este sitio en español?', 'Sí', 'No, gracias'],
              zh: ['以简体中文浏览本网站？', '好的', '不用了'], pa: ['ਕੀ ਇਹ ਵੈੱਬਸਾਈਟ ਪੰਜਾਬੀ ਵਿੱਚ ਵੇਖਣੀ ਹੈ?', 'ਹਾਂ', 'ਨਹੀਂ, ਧੰਨਵਾਦ'] };
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map(function (l) { return String(l).toLowerCase().slice(0, 2); });
    var want = null; for (var i = 0; i < langs.length; i++) { if (langs[i] === 'en') return; if (P[langs[i]]) { want = langs[i]; break; } }
    if (!want) return;
    var alt = document.querySelector('link[rel="alternate"][hreflang^="' + want + '"]'); if (!alt) return;
    var bar = document.createElement('div'); bar.className = 'lang-offer'; bar.setAttribute('role', 'dialog'); bar.setAttribute('lang', want);
    bar.innerHTML = '<p></p><a class="btn btn-solid" data-lang-link></a><button type="button" class="btn btn-line"></button>';
    bar.querySelector('p').textContent = P[want][0];
    var yes = bar.querySelector('a'); yes.textContent = P[want][1]; yes.href = alt.getAttribute('href'); yes.setAttribute('hreflang', want);
    yes.addEventListener('click', function () { set('jp-lang', want); });
    var no = bar.querySelector('button'); no.textContent = P[want][2];
    no.addEventListener('click', function () { set('jp-lang-dismiss', '1'); bar.classList.remove('show'); setTimeout(function () { bar.remove(); }, 400); });
    document.body.appendChild(bar); setTimeout(function () { bar.classList.add('show'); }, 900);
  })();
})();
/* ---------- "Message me" button: open/close menu, count which channel couples use ---------- */
(function () {
  var fab = document.querySelector('.msg-fab'); if (!fab) return;
  var btn = fab.querySelector('.msg-toggle'), menu = fab.querySelector('.msg-menu'), label = fab.querySelector('.msg-label');
  function set(open) {
    fab.setAttribute('data-open', open ? 'true' : 'false'); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open; if (label) label.textContent = open ? btn.getAttribute('data-close') : btn.getAttribute('data-open-label');
    if (open) { var f = menu.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
  }
  btn.addEventListener('click', function () { set(menu.hidden); });
  document.querySelectorAll('[data-open-msg]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); set(true); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!menu.hidden && !fab.contains(e.target)) set(false); });
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-channel]'); if (!a) return;
    var ch = a.getAttribute('data-channel');
    try { if (typeof window.gtag === 'function') { window.gtag('event', 'contact_click', { channel: ch, page_path: location.pathname }); if (ch === 'whatsapp') window.gtag('event', 'whatsapp_click', { page_path: location.pathname }); } } catch (err) {}
  });
})();
