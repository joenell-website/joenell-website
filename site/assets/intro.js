/* Homepage magazine intro: first visit opens a short magazine of real stories (wedding first);
   on the last page it closes and the visitor lands on the homepage. Skip any time.
   ?intro=1 forces it, ?intro=0 hides it. Shown at most once a week per browser. Not shown to crawlers.    Page turning uses StPageFlip (assets/pageflip.js, MIT). */
(function () {
  var H = document.documentElement, q = location.search;
  function off() { H.classList.remove('jm-on'); }
  var force = /[?&]intro=1/.test(q), never = /[?&]intro=0/.test(q);
  var bot = /bot|crawl|spider|slurp|lighthouse|headless|google|bing|yandex|baidu|duckduck|facebookexternal|pinterest|preview/i.test(navigator.userAgent) || navigator.webdriver;
  var seen = 0; try { seen = +localStorage.getItem('jm-seen') || 0; } catch (e) {}
  if (!force && (never || bot || Date.now() - seen < 7 * 864e5)) { off(); return; }

  var V = '20261125a', lang = (H.lang || 'en').slice(0, 2).toLowerCase();
  var base = lang === 'en' ? '' : '/' + lang;
  var T = {
    en: { skip: 'Skip intro', prev: 'Previous page', next: 'Next page', hint: 'Tap or swipe to turn the page', aria: 'The Joenell magazine',
      issue: 'Issue 01 · Vancouver, BC · 2026', coverH: 'Love stories, as they felt.',
      cl: ['The wedding: a garden in autumn', 'She said yes at Bowen Lookout', 'Stanley Park, then the beach at sunset', 'Tulip season in Langley'],
      contents: 'In this issue', noteK: 'A note from the photographer',
      note: "Hello, I'm Joenell. I photograph weddings, engagements, surprise proposals and elopements across Vancouver and British Columbia. I keep things calm and natural, so your photos look the way the day felt. Here are a few of the stories couples have trusted me with.",
      w: ['Wedding · Autumn garden', 'A garden wedding in autumn', 'From the last quiet minutes of getting ready to a walk through the garden as husband and wife.'],
      wc: ['Getting ready', 'Rings on, then a walk through the garden', 'Autumn light', 'A few minutes alone before dinner'],
      p: ['Surprise proposal · Cypress Mountain', 'She said yes at Bowen Lookout', 'Cypress Mountain, West Vancouver', 'I stayed hidden nearby, so she never saw the camera until she said yes. Then a few relaxed portraits with all of Howe Sound behind them.'],
      e: ['Engagement · Stanley Park', 'Stanley Park, then the beach at sunset', 'Cherry blossoms in Stanley Park, then down to the beach as the sun went down.', 'Golden hour'],
      t: ['Engagement · Langley', 'Tulip season in Langley', 'A bright spring afternoon among the tulips, dressed in white and cream. No rush and no posing, just the two of them.'],
      end: ['A quiet walk for two', 'Next issue', 'Your story could be next.', 'Weddings, engagements, surprise proposals and elopements across Vancouver and BC.', 'Book your date', 'Enter the website'] },
    fr: { skip: 'Passer l’intro', prev: 'Page précédente', next: 'Page suivante', hint: 'Touchez ou glissez pour tourner la page', aria: 'Le magazine Joenell',
      issue: 'Numéro 01 · Vancouver, C.-B. · 2026', coverH: 'Des histoires d’amour, telles qu’elles ont été vécues.',
      cl: ['Le mariage : un jardin en automne', 'Elle a dit oui à Bowen Lookout', 'Stanley Park, puis la plage au coucher du soleil', 'La saison des tulipes à Langley'],
      contents: 'Dans ce numéro', noteK: 'Un mot du photographe',
      note: 'Bonjour, je suis Joenell. Je photographie des mariages, des fiançailles, des demandes surprises et des élopements à Vancouver et partout en Colombie-Britannique. Je garde les choses calmes et naturelles, pour que vos photos ressemblent à ce que vous avez vécu. Voici quelques histoires que des couples m’ont confiées.',
      w: ['Mariage · Jardin d’automne', 'Un mariage au jardin, en automne', 'Des derniers instants calmes des préparatifs jusqu’à une promenade dans le jardin, mari et femme.'],
      wc: ['Les préparatifs', 'Les alliances, puis une promenade dans le jardin', 'Lumière d’automne', 'Quelques minutes seuls avant le dîner'],
      p: ['Demande surprise · Cypress Mountain', 'Elle a dit oui à Bowen Lookout', 'Cypress Mountain, West Vancouver', 'Je suis resté caché tout près : elle n’a vu l’appareil qu’après avoir dit oui. Puis quelques portraits détendus, avec tout Howe Sound derrière eux.'],
      e: ['Fiançailles · Stanley Park', 'Stanley Park, puis la plage au coucher du soleil', 'Les cerisiers en fleurs de Stanley Park, puis la plage pendant que le soleil se couchait.', 'L’heure dorée'],
      t: ['Fiançailles · Langley', 'La saison des tulipes à Langley', 'Un après-midi de printemps lumineux parmi les tulipes, en blanc et crème. Sans se presser et sans poser, juste eux deux.'],
      end: ['Une balade à deux', 'Le prochain numéro', 'Votre histoire pourrait être la prochaine.', 'Mariages, fiançailles, demandes surprises et élopements à Vancouver et en C.-B.', 'Réserver votre date', 'Entrer sur le site'] },
    es: { skip: 'Saltar intro', prev: 'Página anterior', next: 'Página siguiente', hint: 'Toca o desliza para pasar la página', aria: 'La revista Joenell',
      issue: 'Número 01 · Vancouver, BC · 2026', coverH: 'Historias de amor, tal como se vivieron.',
      cl: ['La boda: un jardín en otoño', 'Dijo que sí en Bowen Lookout', 'Stanley Park y luego la playa al atardecer', 'Temporada de tulipanes en Langley'],
      contents: 'En este número', noteK: 'Una nota del fotógrafo',
      note: 'Hola, soy Joenell. Fotografío bodas, compromisos, pedidas sorpresa y fugas románticas en Vancouver y en toda Columbia Británica. Mantengo todo tranquilo y natural, para que tus fotos se parezcan a cómo se sintió el día. Aquí tienes algunas de las historias que las parejas me han confiado.',
      w: ['Boda · Jardín de otoño', 'Una boda en el jardín, en otoño', 'Desde los últimos minutos tranquilos de los preparativos hasta un paseo por el jardín como marido y mujer.'],
      wc: ['Los preparativos', 'Los anillos y luego un paseo por el jardín', 'Luz de otoño', 'Unos minutos a solas antes de la cena'],
      p: ['Pedida sorpresa · Cypress Mountain', 'Dijo que sí en Bowen Lookout', 'Cypress Mountain, West Vancouver', 'Me quedé escondido cerca, así que ella no vio la cámara hasta que dijo que sí. Después, unos retratos relajados con todo Howe Sound detrás.'],
      e: ['Compromiso · Stanley Park', 'Stanley Park y luego la playa al atardecer', 'Cerezos en flor en Stanley Park y después la playa mientras se ponía el sol.', 'La hora dorada'],
      t: ['Compromiso · Langley', 'Temporada de tulipanes en Langley', 'Una tarde luminosa de primavera entre tulipanes, vestidos de blanco y crema. Sin prisas y sin posar, solo ellos dos.'],
      end: ['Un paseo tranquilo para dos', 'El próximo número', 'Tu historia podría ser la próxima.', 'Bodas, compromisos, pedidas sorpresa y fugas románticas en Vancouver y BC.', 'Reserva tu fecha', 'Entrar al sitio'] },
    zh: { skip: '跳过', prev: '上一页', next: '下一页', hint: '轻触或滑动翻页', aria: 'Joenell 杂志',
      issue: '第 01 期 · 卑诗省温哥华 · 2026', coverH: '爱的故事，如当时的感受。',
      cl: ['婚礼：秋日花园', '她在 Bowen Lookout 说了“我愿意”', '斯坦利公园，然后是日落海滩', '兰里的郁金香季'],
      contents: '本期内容', noteK: '摄影师的话',
      note: '你好，我是 Joenell。我在温哥华和卑诗省各地拍摄婚礼、订婚、惊喜求婚和私奔婚礼。我让一切保持平静自然，让照片呈现那一天真实的感受。以下是几对新人托付给我的故事。',
      w: ['婚礼 · 秋日花园', '秋日花园婚礼', '从准备时最后的安静时刻，到以夫妻身份在花园中漫步。'],
      wc: ['准备时刻', '交换戒指，然后在花园漫步', '秋日光线', '晚宴前独处的几分钟'],
      p: ['惊喜求婚 · Cypress 山', '她在 Bowen Lookout 说了“我愿意”', '西温哥华 Cypress 山', '我躲在附近，所以她直到说“我愿意”才看到相机。之后，以整个豪湾为背景拍了几张轻松的合影。'],
      e: ['订婚 · 斯坦利公园', '斯坦利公园，然后是日落海滩', '斯坦利公园的樱花，然后在日落时分来到海滩。', '黄金时刻'],
      t: ['订婚 · 兰里', '兰里的郁金香季', '一个明媚的春日午后，身着白色与米色，漫步在郁金香之间。不赶时间，不摆姿势，只有他们两人。'],
      end: ['两个人的安静漫步', '下一期', '下一个故事可能是你们的。', '温哥华及卑诗省的婚礼、订婚、惊喜求婚和私奔婚礼。', '预订日期', '进入网站'] },
    pa: { skip: 'ਇੰਟਰੋ ਛੱਡੋ', prev: 'ਪਿਛਲਾ ਪੰਨਾ', next: 'ਅਗਲਾ ਪੰਨਾ', hint: 'ਪੰਨਾ ਪਲਟਣ ਲਈ ਛੂਹੋ ਜਾਂ ਸਵਾਈਪ ਕਰੋ', aria: 'Joenell ਮੈਗਜ਼ੀਨ',
      issue: 'ਅੰਕ 01 · ਵੈਨਕੂਵਰ, BC · 2026', coverH: 'ਪਿਆਰ ਦੀਆਂ ਕਹਾਣੀਆਂ, ਜਿਵੇਂ ਉਹ ਮਹਿਸੂਸ ਹੋਈਆਂ।',
      cl: ['ਵਿਆਹ: ਪਤਝੜ ਵਿੱਚ ਇੱਕ ਬਗੀਚਾ', 'Bowen Lookout ਤੇ ਉਸਨੇ ਹਾਂ ਕਿਹਾ', 'Stanley Park, ਫਿਰ ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ ਬੀਚ', 'Langley ਵਿੱਚ ਟਿਊਲਿਪ ਦਾ ਮੌਸਮ'],
      contents: 'ਇਸ ਅੰਕ ਵਿੱਚ', noteK: 'ਫੋਟੋਗ੍ਰਾਫਰ ਵੱਲੋਂ',
      note: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ Joenell ਹਾਂ। ਮੈਂ ਵੈਨਕੂਵਰ ਅਤੇ ਪੂਰੇ ਬ੍ਰਿਟਿਸ਼ ਕੋਲੰਬੀਆ ਵਿੱਚ ਵਿਆਹ, ਮੰਗਣੀ, ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ ਅਤੇ ਇਲੋਪਮੈਂਟ ਦੀਆਂ ਫੋਟੋਆਂ ਖਿੱਚਦਾ ਹਾਂ। ਮੈਂ ਸਭ ਕੁਝ ਸ਼ਾਂਤ ਅਤੇ ਕੁਦਰਤੀ ਰੱਖਦਾ ਹਾਂ, ਤਾਂ ਜੋ ਤੁਹਾਡੀਆਂ ਫੋਟੋਆਂ ਉਸ ਦਿਨ ਦੇ ਅਹਿਸਾਸ ਵਰਗੀਆਂ ਲੱਗਣ। ਇੱਥੇ ਕੁਝ ਕਹਾਣੀਆਂ ਹਨ ਜੋ ਜੋੜਿਆਂ ਨੇ ਮੈਨੂੰ ਸੌਂਪੀਆਂ।',
      w: ['ਵਿਆਹ · ਪਤਝੜ ਦਾ ਬਾਗ਼', 'ਪਤਝੜ ਵਿੱਚ ਬਗੀਚੇ ਦਾ ਵਿਆਹ', 'ਤਿਆਰ ਹੋਣ ਦੇ ਆਖਰੀ ਸ਼ਾਂਤ ਪਲਾਂ ਤੋਂ ਲੈ ਕੇ ਪਤੀ-ਪਤਨੀ ਵਜੋਂ ਬਗੀਚੇ ਵਿੱਚ ਸੈਰ ਤੱਕ।'],
      wc: ['ਤਿਆਰੀ', 'ਮੁੰਦਰੀਆਂ, ਫਿਰ ਬਗੀਚੇ ਵਿੱਚ ਸੈਰ', 'ਪਤਝੜ ਦੀ ਰੌਸ਼ਨੀ', 'ਰਾਤ ਦੇ ਖਾਣੇ ਤੋਂ ਪਹਿਲਾਂ ਕੁਝ ਪਲ ਇਕੱਲੇ'],
      p: ['ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ · Cypress Mountain', 'Bowen Lookout ਤੇ ਉਸਨੇ ਹਾਂ ਕਿਹਾ', 'Cypress Mountain, ਵੈਸਟ ਵੈਨਕੂਵਰ', 'ਮੈਂ ਨੇੜੇ ਲੁਕਿਆ ਰਿਹਾ, ਇਸ ਲਈ ਉਸ ਨੇ ਹਾਂ ਕਹਿਣ ਤੱਕ ਕੈਮਰਾ ਨਹੀਂ ਦੇਖਿਆ। ਫਿਰ ਪਿੱਛੇ ਪੂਰੇ Howe Sound ਨਾਲ ਕੁਝ ਆਰਾਮਦਾਇਕ ਪੋਰਟਰੇਟ।'],
      e: ['ਮੰਗਣੀ · Stanley Park', 'Stanley Park, ਫਿਰ ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ ਬੀਚ', 'Stanley Park ਵਿੱਚ ਚੈਰੀ ਦੇ ਫੁੱਲ, ਫਿਰ ਸੂਰਜ ਡੁੱਬਦੇ ਵੇਲੇ ਬੀਚ ਵੱਲ।', 'ਸੁਨਹਿਰੀ ਘੰਟਾ'],
      t: ['ਮੰਗਣੀ · Langley', 'Langley ਵਿੱਚ ਟਿਊਲਿਪ ਦਾ ਮੌਸਮ', 'ਟਿਊਲਿਪਾਂ ਵਿਚਕਾਰ ਬਸੰਤ ਦੀ ਇੱਕ ਚਮਕਦਾਰ ਦੁਪਹਿਰ, ਚਿੱਟੇ ਅਤੇ ਕਰੀਮ ਰੰਗ ਵਿੱਚ। ਕੋਈ ਕਾਹਲੀ ਨਹੀਂ, ਕੋਈ ਪੋਜ਼ ਨਹੀਂ, ਬੱਸ ਉਹ ਦੋਵੇਂ।'],
      end: ['ਦੋਵਾਂ ਲਈ ਇੱਕ ਸ਼ਾਂਤ ਸੈਰ', 'ਅਗਲਾ ਅੰਕ', 'ਅਗਲੀ ਕਹਾਣੀ ਤੁਹਾਡੀ ਹੋ ਸਕਦੀ ਹੈ।', 'ਵੈਨਕੂਵਰ ਅਤੇ BC ਵਿੱਚ ਵਿਆਹ, ਮੰਗਣੀ, ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ ਅਤੇ ਇਲੋਪਮੈਂਟ।', 'ਆਪਣੀ ਤਾਰੀਖ਼ ਬੁੱਕ ਕਰੋ', 'ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਜਾਓ'] }
  };
  var t = T[lang] || T.en;

  /* ---------- page builders (one grid: margin = 7% of page width; photos keep their real shape) ---------- */
  var SZ = {'cl-wedding-path': [1600, 1067], 'cl-wedding-bench': [1600, 1066], 'cl-wedding-dip': [1600, 1066], 'cl-wedding-portrait-w': [1600, 1173],
    'jh-lookout': [1600, 1280], 'jh-engaged': [1600, 1280], 'cl-engagement-beach': [1600, 1280], 'cl-engagement-cover': [1600, 1280],
    'st-cover': [1600, 1067], 'st-arbor-kiss': [1600, 1066]};
  function src(n) { return '/images/alb-' + n + '.jpg?v=' + V; }
  function im(n, fx, fy, alt) { return '<img data-src="' + src(n) + '" alt="' + (alt || '') + '" draggable="false" decoding="async" style="object-position:' + fx + '% ' + fy + '%">'; }
  function fol(i) { return '<span class="jm-fol">' + (i < 10 ? '0' : '') + i + '<em>Joenell</em></span>'; }
  function fig(x) {
    var z = SZ[x[0]] || [4, 3];
    return '<figure><span class="jm-im" style="aspect-ratio:' + z[0] + '/' + z[1] + ';max-height:calc(var(--u) * ' + (86 * z[1] / z[0] * 1.32).toFixed(1) + ')">' + im(x[0], x[1], x[2], x[3]) + '</span>' + (x[4] ? '<figcaption>' + x[4] + '</figcaption>' : '') + '</figure>';
  }
  function photo(n, fx, fy, alt, cap) {
    return function (i) { return '<div class="jm-pg jm-photo">' + im(n, fx, fy, alt) + (cap ? '<span class="jm-cap">' + cap + '</span>' : '') + '</div>'; };
  }
  function opener(n, fx, fy, k, h) {
    return function (i) { return '<div class="jm-pg jm-photo jm-open">' + im(n, fx, fy, h) + '<div class="jm-ot"><span class="jm-k lt">' + k + '</span><h2>' + h + '</h2></div></div>'; };
  }
  function story(k, h, sub, p, figs) {
    return function (i) {
      return '<div class="jm-pg jm-story"><span class="jm-k">' + k + '</span><h2>' + h + '</h2>' + (sub ? '<span class="jm-sub">' + sub + '</span>' : '') +
        '<p class="jm-drop">' + p + '</p><div class="jm-figs">' + figs.map(fig).join('') + '</div>' + fol(i) + '</div>';
    };
  }
  function stagger(a, b) {
    return function (i) { return '<div class="jm-pg jm-story jm-stg"><div class="jm-figs">' + fig(a) + fig(b) + '</div>' + fol(i) + '</div>'; };
  }
  var TH = ['cl-wedding-cover-t', 'jh-cover-t', 'cl-engagement-beach-t', 'st-cover-t'], TOC = [];
  function toc(i) {
    return '<div class="jm-pg jm-toc"><span class="jm-k">' + t.contents + '</span><ol>' +
      t.cl.map(function (c, j) { return '<li><span class="jm-th">' + im(TH[j], 50, 40, '') + '</span><b>' + (TOC[j] < 10 ? '0' : '') + TOC[j] + '</b><span>' + c + '</span></li>'; }).join('') +
      '</ol><div class="jm-letter"><span class="jm-k">' + t.noteK + '</span><p class="jm-note">' + t.note + '</p><span class="jm-sig">Joenell</span></div>' + fol(i) + '</div>';
  }
  function cover() {
    return '<div class="jm-pg jm-cover"><div class="jm-mast"><span class="jm-iss">' + t.issue + '</span><span class="jm-logo">JOENELL</span><span class="jm-ph">Photography</span></div>' +
      '<div class="jm-cimg">' + im('cl-wedding-kiss', 55, 28, t.w[1]) + '</div>' +
      '<div class="jm-cl"><h1>' + t.coverH + '</h1><ul>' + t.cl.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul></div></div>';
  }
  function endp(i) {
    return '<div class="jm-pg jm-end"><span class="jm-k">' + t.end[1] + '</span><h2>' + t.end[2] + '</h2><p>' + t.end[3] + '</p>' +
      '<a class="jm-btn" href="' + base + '/contact" data-jm="book">' + t.end[4] + '</a><button type="button" class="jm-enter" data-jm="enter">' + t.end[5] + ' <i aria-hidden="true">&rarr;</i></button>' + fol(i) + '</div>';
  }
  function back() { return '<div class="jm-pg jm-back"><span class="jm-logo">JOENELL</span><span class="jm-ph">Photography</span><span class="jm-url">joenellphotography.ca</span></div>'; }
  var F = {
    path: ['cl-wedding-path', 42, 45, t.wc[1], t.wc[1]], bench: ['cl-wedding-bench', 50, 45, t.wc[3]],
    dip: ['cl-wedding-dip', 50, 40, t.wc[3], t.wc[3]], portw: ['cl-wedding-portrait-w', 50, 30, t.wc[2], t.wc[2]],
    look: ['jh-lookout', 58, 60, t.p[1]], engd: ['jh-engaged', 50, 40, t.p[1]],
    beach: ['cl-engagement-beach', 45, 40, t.e[3], t.e[3]], sun: ['cl-engagement-cover', 50, 50, t.e[1]],
    stc: ['st-cover', 50, 55, t.t[1]], arb: ['st-arbor-kiss', 50, 45, t.t[1]]
  };
  /* Two-page spreads (computer) */
  var DESK = [cover, toc,
    opener('cl-wedding-veil', 55, 26, t.w[0], t.w[1]), story(t.w[0], t.w[1], '', t.w[2], [F.path, F.bench]),
    photo('cl-wedding-bride', 46, 30, t.wc[0], t.wc[0]), photo('cl-wedding-kiss-w', 50, 35, t.w[1]),
    stagger(F.dip, F.portw), story(t.p[0], t.p[1], t.p[2], t.p[3], [F.look]),
    photo('jh-kiss', 50, 28, t.p[1]), photo('cl-engagement-blossom-gaze', 50, 26, t.e[1]),
    story(t.e[0], t.e[1], '', t.e[2], [F.beach]), story(t.t[0], t.t[1], '', t.t[2], [F.stc, F.arb]),
    photo('st-03', 50, 28, t.t[1]), photo('je-1', 50, 40, t.end[0], t.end[0]), endp, back];
  /* One page at a time (phone): tall pages, so wide photos sit in pairs instead of being cut down */
  var PHONE = [cover, toc,
    opener('cl-wedding-veil', 55, 26, t.w[0], t.w[1]), story(t.w[0], t.w[1], '', t.w[2], [F.path, F.bench]),
    photo('cl-wedding-bride', 46, 30, t.wc[0], t.wc[0]), stagger(F.dip, F.portw),
    story(t.p[0], t.p[1], t.p[2], t.p[3], [F.look, F.engd]), photo('jh-kiss', 50, 28, t.p[1]),
    photo('cl-engagement-blossom-gaze', 50, 26, t.e[1]), story(t.e[0], t.e[1], '', t.e[2], [F.beach, F.sun]),
    story(t.t[0], t.t[1], '', t.t[2], [F.stc, F.arb]), photo('st-03', 50, 28, t.t[1]),
    photo('je-1', 50, 34, t.end[0], t.end[0]), endp, back];
  var P = DESK, NP = P.length;

  /* ---------- styles ---------- */
  var css = 'html.jm-on body{overflow:hidden}' +
    '.jm{position:fixed;inset:0;z-index:2147483000;background:#11100e radial-gradient(90% 80% at 50% 45%,#34302a 0%,#191714 60%,#0e0d0c 100%);color:#F3EEE7;font-family:Jost,system-ui,sans-serif;visibility:visible;transition:opacity .9s ease;-webkit-tap-highlight-color:transparent;overflow:hidden}' +
    '.jm.out{opacity:0;pointer-events:none}.jm.out .jm-host{transform:scale(.92)!important}' +
    '.stf__parent{display:block;box-sizing:border-box;transform:translateZ(0);touch-action:pan-y}.stf__parent canvas{position:absolute;width:100%;height:100%;left:0;top:0}.stf__block{position:absolute;width:100%;height:100%;box-sizing:border-box;perspective:2000px}.stf__item{display:none;position:absolute;transform-style:preserve-3d}.stf__outerShadow,.stf__innerShadow,.stf__hardShadow,.stf__hardInnerShadow{position:absolute;left:0;top:0}' +
    '.jm .jm-host{position:absolute;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.jm-host .stf__wrapper{position:absolute!important;inset:0;padding:0!important}' +
    '.jm-host .stf__block{perspective:2600px}' +
    '.jm-item{background:#FAF8F4}' +
    '.jm.land .stf__item.--left{box-shadow:-1px 0 0 #efeae1,-2px 1px 0 #d8d0c2,-3px 1px 0 #ede8de,-4px 2px 0 #d3cabb,-5px 2px 0 #ebe5da,-6px 3px 0 #cfc6b6,-12px 30px 50px -20px rgba(0,0,0,.75)}' +
    '.jm.land .stf__item.--right{box-shadow:1px 0 0 #efeae1,2px 1px 0 #d8d0c2,3px 1px 0 #ede8de,4px 2px 0 #d3cabb,5px 2px 0 #ebe5da,6px 3px 0 #cfc6b6,12px 30px 50px -20px rgba(0,0,0,.75)}' +
    '.jm.port .stf__item{box-shadow:0 0 0 rgba(0,0,0,0)}' +
    '.jm-pg{position:absolute;inset:0;overflow:hidden;background:#FAF8F4;color:#2B2926;font-size:clamp(13px,calc(var(--u)*2.9),19px);line-height:1.55;--m:calc(var(--u)*7)}' +
    '.jm-pg:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:6}' +
    '.jm.land .stf__item.--left .jm-pg:after{background:linear-gradient(90deg,rgba(255,255,255,.05) 0,rgba(0,0,0,0) 80%,rgba(0,0,0,.10) 93%,rgba(0,0,0,.30) 100%)}' +
    '.jm.land .stf__item.--right .jm-pg:after{background:linear-gradient(270deg,rgba(255,255,255,.05) 0,rgba(0,0,0,0) 80%,rgba(0,0,0,.10) 93%,rgba(0,0,0,.30) 100%)}' +
    '.jm.port .jm-pg:after{background:linear-gradient(90deg,rgba(0,0,0,.18),rgba(0,0,0,0) 5%)}' +
    '.jm-pg img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none;background:#e9e3d8}' +
    '.jm-fol{position:absolute;bottom:calc(var(--m)*.55);left:var(--m);font-size:.66em;letter-spacing:.2em;color:#2B2926;font-weight:500;z-index:3}.jm-fol em{font-style:normal;font-weight:400;color:#8A8278;margin-left:1em;text-transform:uppercase}' +
    '.stf__item.--right .jm-fol{left:auto;right:var(--m)}' +
    '.jm-photo img{position:absolute;inset:0}' +
    '.jm-cap{position:absolute;left:var(--m);bottom:var(--m);z-index:3;color:#fff;font:italic 400 1.1em "Bodoni Moda",Georgia,serif;text-shadow:0 1px 10px rgba(0,0,0,.6);max-width:55%}' +
    '.stf__item.--left .jm-cap{left:var(--m)}' +
    '.jm-open:before{content:"";position:absolute;left:0;right:0;bottom:0;height:50%;z-index:1;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.62))}' +
    '.jm-ot{position:absolute;left:var(--m);right:var(--m);bottom:var(--m);z-index:2;color:#fff}.jm-ot h2{font:400 2.6em/1.05 "Bodoni Moda",Didot,Georgia,serif;margin:.25em 0 0;max-width:10em}' +
    '.jm-k{display:block;font-size:.66em;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:#B8955E}.jm-k.lt{color:#E6D3B3}' +
    '.jm-cover{display:flex;flex-direction:column}' +
    '.jm-mast{flex:0 0 auto;text-align:center;padding:calc(var(--m)*.8) var(--m) calc(var(--m)*.55)}' +
    '.jm-iss{display:block;font-size:.6em;letter-spacing:.3em;text-transform:uppercase;color:#8A8278}' +
    '.jm-logo{display:block;font:400 calc(var(--u)*15) "Bodoni Moda",Didot,Georgia,serif;letter-spacing:.07em;line-height:1;margin-top:.1em;color:#2B2926}' +
    '.jm-ph{display:block;font:italic 400 1em "Bodoni Moda",Georgia,serif;color:#6B645B;letter-spacing:.04em}' +
    '.jm-cimg{position:relative;flex:1 1 auto;min-height:0}.jm-cimg img{position:absolute;inset:0}' +
    '.jm-cimg:after{content:"";position:absolute;left:0;right:0;bottom:0;height:55%;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.66));pointer-events:none}' +
    '.jm-cl{position:absolute;left:var(--m);right:var(--m);bottom:var(--m);z-index:2;color:#fff}' +
    '.jm-cl h1{font:italic 400 2.2em/1.06 "Bodoni Moda",Georgia,serif;margin:0 0 .6em;max-width:11em;text-shadow:0 2px 14px rgba(0,0,0,.4)}' +
    '.jm-cl ul{list-style:none;margin:0;padding:0;border-top:1px solid rgba(255,255,255,.5);max-width:24em}.jm-cl li{font-size:.78em;letter-spacing:.07em;padding:.5em 0;border-bottom:1px solid rgba(255,255,255,.25)}' +
    '.jm-toc,.jm-story,.jm-end{display:flex;flex-direction:column;padding:var(--m) var(--m) calc(var(--m)*1.5)}' +
    '.jm-toc ol{list-style:none;margin:1em 0 0;padding:0}.jm-toc li{display:flex;gap:1em;align-items:baseline;padding:.6em 0;border-bottom:1px solid #E3DCCF;font:400 1.3em/1.25 "Bodoni Moda",Georgia,serif}.jm-toc li b{font:500 .58em Jost,sans-serif;letter-spacing:.14em;color:#B8955E;flex:0 0 auto;width:2em}' +
    '.jm-letter{margin-top:auto;padding-top:1.2em;border-top:1px solid #2B2926}.jm-letter .jm-k{margin-top:.4em}' +
    '.jm-note{font:italic 400 1.05em/1.6 "Bodoni Moda",Georgia,serif;color:#4A453F;margin:.7em 0 .5em}.jm-sig{font:italic 400 1.6em "Bodoni Moda",Georgia,serif}' +
    '.jm-story h2,.jm-end h2{font:400 2.05em/1.08 "Bodoni Moda",Didot,Georgia,serif;margin:.45em 0 .2em;color:#2B2926}' +
    '.jm-sub{display:block;font:italic 400 .95em "Bodoni Moda",Georgia,serif;color:#6B645B}.jm-story p{margin:.8em 0 1.1em;color:#4A453F}' +
    '.jm-drop:first-letter{float:left;font:400 3.4em/.8 "Bodoni Moda",Georgia,serif;margin:.07em .1em 0 0;color:#2B2926}' +
    '.jm-figs{margin-top:auto;padding-top:calc(var(--m)*.45);display:flex;flex-direction:column;justify-content:flex-end;gap:calc(var(--m)*.45);min-height:0;flex:1 1 auto}' +
    '.jm-figs figure{margin:0;display:flex;flex-direction:column;min-height:0;flex:1 1 auto;width:100%;justify-content:flex-end}' +
    '.jm-im{position:relative;display:block;flex:1 1 auto;min-height:0;overflow:hidden;width:100%}.jm-stg .jm-figs,.jm-stg figure,.jm-stg .jm-im{flex:0 1 auto}' +
    '.jm-figs figcaption{flex:0 0 auto;font:italic 400 .88em "Bodoni Moda",Georgia,serif;color:#6B645B;padding-top:.4em}' +
    '.jm-stg .jm-figs{margin:auto 0;justify-content:center;gap:calc(var(--m)*.7)}.jm-stg figure{width:78%}.jm-stg figure:nth-child(2){align-self:flex-end}.jm-stg figure:nth-child(2) figcaption{text-align:right}' +
    '.jm.port .jm-stg figure{width:100%}' +
    '.jm-th{position:relative;flex:0 0 auto;width:4.2em;height:3.2em;overflow:hidden;align-self:center}.jm-toc li{align-items:center!important}' +
    '.jm .wmk{opacity:.5!important;transform:scale(.68);transform-origin:right bottom}.jm .jm-th .wmk{display:none}' +
    '.jm-end{justify-content:center}.jm-end p{color:#4A453F;margin:.5em 0 1.8em;max-width:22em}' +
    '.jm-btn{display:inline-block;align-self:flex-start;background:#3E4A3D;color:#fff;text-decoration:none;padding:.95em 1.7em;border-radius:99px;font-weight:500;letter-spacing:.03em}.jm-btn:hover{background:#2F392E}' +
    '.jm-enter{align-self:flex-start;margin-top:1.1em;background:none;border:0;border-bottom:1px solid #2B2926;padding:.2em 0;font:500 1em Jost,sans-serif;color:#2B2926;cursor:pointer}' +
    '.jm-back{background:#2F392E;color:#F3EEE7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.jm-back .jm-logo{color:#F3EEE7;font-size:calc(var(--u)*11)}.jm-back .jm-ph{color:#C9A27E}.jm-url{position:absolute;bottom:var(--m);font-size:.7em;letter-spacing:.2em;color:#bdb4a6}' +
    '.jm-ui{position:absolute;z-index:20;display:flex;align-items:center;gap:10px}' +
    '.jm-skip{top:14px;right:14px;background:rgba(20,19,17,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(243,238,231,.3);color:#F3EEE7;border-radius:99px;padding:9px 16px;font:500 13px Jost,system-ui,sans-serif;letter-spacing:.04em;cursor:pointer}.jm-skip:hover{background:rgba(60,56,50,.7)}' +
    '.jm-nav{top:50%;margin-top:-24px;width:48px;height:48px;border-radius:50%;border:1px solid rgba(243,238,231,.3);background:rgba(20,19,17,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#F3EEE7;font-size:26px;line-height:1;cursor:pointer;justify-content:center;transition:opacity .3s}.jm-nav:hover{background:rgba(60,56,50,.7)}.jm-nav[disabled]{opacity:0;pointer-events:none}' +
    '.jm-pv{left:14px}.jm-nx{right:14px}' +
    '.jm.port .jm-nav{top:auto;bottom:16px;margin:0;width:42px;height:42px}' +
    '.jm-prog{left:0;right:0;bottom:0;height:3px;background:rgba(243,238,231,.12)}.jm-prog i{display:block;height:100%;width:0;background:#C9A27E}' +
    '.jm-count{top:22px;left:20px;font-size:11px;letter-spacing:.24em;color:rgba(243,238,231,.7)}.jm.port .jm-count{display:none}' +
    '.jm.port .jm-toc,.jm.port .jm-story,.jm.port .jm-end{padding-top:calc(var(--m) + 46px);padding-bottom:calc(var(--m) + 52px)}.jm.port .jm-mast{padding-top:calc(var(--m)*.6 + 44px)}' +
    '.jm.port .jm-cap,.jm.port .jm-ot,.jm.port .jm-cl{bottom:calc(var(--m) + 56px)}.jm.port .jm-fol,.jm.port .stf__item.--right .jm-fol{left:50%;right:auto;transform:translateX(-50%);bottom:30px;white-space:nowrap}.jm.port .jm-url{bottom:76px}' +
    '@media (prefers-reduced-motion:reduce){.jm,.jm-host{transition:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- shell ---------- */
  var el = document.createElement('div');
  el.className = 'jm'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', t.aria);
  el.innerHTML = '<span class="jm-ui jm-count" aria-live="polite"></span><button type="button" class="jm-ui jm-skip">' + t.skip + ' &times;</button>' +
    '<button type="button" class="jm-ui jm-nav jm-pv" aria-label="' + t.prev + '">&#8249;</button><button type="button" class="jm-ui jm-nav jm-nx" aria-label="' + t.next + '">&#8250;</button>' +
    '<span class="jm-ui jm-prog"><i></i></span>';
  var cnt = el.querySelector('.jm-count'), bar = el.querySelector('.jm-prog i'), bp = el.querySelector('.jm-pv'), bn = el.querySelector('.jm-nx');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pf = null, host = null, kind = '', cur = 0, timer = null, hold = false, done = false, DUR = 5200, pw = 0;
  function gt(n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} }

  function hydrate(c) {
    if (!host) return;
    var items = host.querySelectorAll('.jm-item');
    for (var i = Math.max(0, c - 2); i <= Math.min(NP - 1, c + 5); i++) {
      [].forEach.call(items[i].querySelectorAll('img[data-src]'), function (x) { x.src = x.getAttribute('data-src'); x.removeAttribute('data-src'); });
    }
  }
  function measure() {
    var v = host && host.querySelector('.stf__item[style*="display: block"]');
    pw = v ? v.offsetWidth : pw;
    if (pw) host.style.setProperty('--u', (pw / 100) + 'px');
    shift();
  }
  function shift() {
    if (!host) return;
    var x = 0;
    if (kind === 'land' && pw) { if (cur === 0) x = -pw / 2; else if (cur >= NP - 1) x = pw / 2; }
    host.style.transform = 'translateX(' + x + 'px)';
  }
  function ui() {
    var land = kind === 'land', views = land ? NP / 2 + 1 : NP, v = land ? (cur === 0 ? 0 : Math.floor((cur + 1) / 2)) : cur;
    cnt.textContent = (v + 1) + ' / ' + views;
    if (cur === 0) bp.setAttribute('disabled', ''); else bp.removeAttribute('disabled');
    restart();
  }
  function restart() {
    clearTimeout(timer); bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
    if (hold || done) return;
    bar.style.transition = 'width ' + DUR + 'ms linear'; bar.style.width = '100%';
    timer = setTimeout(function () { if (cur >= NP - 1) finish('complete'); else next(); }, cur >= NP - 1 ? 2600 : DUR);
  }
  function next() { if (!pf || done) return; if (cur >= NP - 1) { finish('complete'); return; } pf.flipNext('bottom'); }
  function prev() { if (pf && !done) pf.flipPrev('bottom'); }

  function build(start) {
    if (pf) { try { pf.destroy(); } catch (e) {} pf = null; }
    var vw = window.innerWidth, vh = window.innerHeight;
    kind = (vw >= 900 && vw / vh > 1.1) ? 'land' : 'port';
    el.classList.remove('land', 'port'); el.classList.add(kind);
    host = document.createElement('div'); host.className = 'jm-host';
    var gx = kind === 'land' ? 76 : 0, gy = kind === 'land' ? 22 : 0;
    host.style.cssText = 'left:' + gx + 'px;right:' + gx + 'px;top:' + gy + 'px;bottom:' + gy + 'px';
    P = kind === 'land' ? DESK : PHONE; NP = P.length; TOC = kind === 'land' ? [2, 7, 9, 11] : [2, 6, 8, 10];
    if (start) start = Math.min(start, NP - 1);
    host.innerHTML = P.map(function (f, i) { return '<div class="jm-item"' + (i === 0 || i === NP - 1 ? ' data-density="hard"' : '') + '>' + f(i) + '</div>'; }).join('');
    el.insertBefore(host, el.firstChild);
    var W = kind === 'land' ? 850 : Math.max(300, vw), Hh = kind === 'land' ? 1100 : Math.max(400, vh);
    pf = new window.St.PageFlip(host, {
      width: W, height: Hh, size: 'stretch', minWidth: kind === 'land' ? 150 : Math.ceil(vw * 0.6), maxWidth: 3000, minHeight: 200, maxHeight: 4000,
      autoSize: false, showCover: true, usePortrait: kind === 'port', drawShadow: true, maxShadowOpacity: 0.55,
      flippingTime: reduce ? 300 : 1100, mobileScrollSupport: false, startPage: start || 0, showPageCorners: true, swipeDistance: 24, startZIndex: 1
    });
    pf.loadFromHTML(host.querySelectorAll('.jm-item'));
    cur = pf.getCurrentPageIndex();
    hydrate(cur);
    pf.on('flip', function (e) { cur = e.data; hydrate(cur); shift(); ui(); });
    pf.on('changeState', function (e) {
      if (e.data === 'flipping' || e.data === 'user_fold') { clearTimeout(timer); if (kind === 'land' && (cur === 0 || cur >= NP - 1)) { host.style.transform = 'translateX(0)'; } }
    });
    pf.on('update', function () { setTimeout(measure, 30); });
    setTimeout(measure, 30);
    ui();
  }

  function finish(how) {
    if (done) return; done = true; clearTimeout(timer);
    try { localStorage.setItem('jm-seen', String(Date.now())); } catch (e) {}
    gt('intro_' + how, { page: cur + 1 });
    el.classList.add('out');
    document.removeEventListener('keydown', key);
    window.removeEventListener('resize', onResize);
    setTimeout(function () { try { pf && pf.destroy(); } catch (e) {} el.remove(); H.classList.remove('jm-on'); window.scrollTo(0, 0); window.dispatchEvent(new Event('resize')); }, reduce ? 0 : 900);
  }
  function key(e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Escape') finish('skip');
  }
  var rt; function onResize() {
    clearTimeout(rt); rt = setTimeout(function () {
      var vw = window.innerWidth, vh = window.innerHeight, k = (vw >= 900 && vw / vh > 1.1) ? 'land' : 'port';
      if (k !== kind || kind === 'port') build(cur); else measure();
    }, 200);
  }

  el.querySelector('.jm-skip').addEventListener('click', function () { finish('skip'); });
  bn.addEventListener('click', next);
  bp.addEventListener('click', prev);
  el.addEventListener('click', function (e) {
    var a = e.target.closest('[data-jm]');
    if (a) { if (a.getAttribute('data-jm') === 'enter') finish('complete'); else { try { localStorage.setItem('jm-seen', String(Date.now())); } catch (x) {} gt('intro_book'); } }
  });
  el.addEventListener('pointerdown', function (e) { if (e.target.closest('.jm-host')) { hold = true; clearTimeout(timer); bar.style.transition = 'none'; bar.style.width = '0'; } });
  el.addEventListener('pointerup', function () { if (hold) { hold = false; setTimeout(restart, 1300); } });
  document.addEventListener('keydown', key);
  window.addEventListener('resize', onResize);

  function start() {
    document.body.appendChild(el);
    build(0);
    el.querySelector('.jm-skip').focus({ preventScroll: true });
    gt('intro_view');
  }
  function load() {
    if (window.St && window.St.PageFlip) return start();
    var s = document.createElement('script'); s.src = '/assets/pageflip.js?v=1'; s.onload = start; s.onerror = function () { H.classList.remove('jm-on'); };
    document.head.appendChild(s);
  }
  if (document.body) load(); else document.addEventListener('DOMContentLoaded', load);
})();
