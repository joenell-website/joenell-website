/* Homepage magazine intro: first visit opens a short magazine of real stories (wedding first);
   on the last page it closes and the visitor lands on the homepage. Skip any time.
   ?intro=1 forces it, ?intro=0 hides it. Shown at most once a week per browser. Not shown to crawlers. */
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
      w: ['Wedding · Chris & Lorena', 'A garden wedding in autumn', 'From the last quiet minutes of getting ready to a walk through the garden as husband and wife.'],
      wc: ['Getting ready', 'Rings on, then a walk through the garden', 'Autumn light', 'A few minutes alone before dinner'],
      p: ['Surprise proposal · Jake & Hannah', 'She said yes at Bowen Lookout', 'Cypress Mountain, West Vancouver', 'I stayed hidden nearby, so Hannah never saw the camera until she said yes. Then a few relaxed portraits with all of Howe Sound behind them.'],
      e: ['Engagement · Chris & Lorena', 'Stanley Park, then the beach at sunset', 'Cherry blossoms in Stanley Park, then down to the beach as the sun went down.', 'Golden hour'],
      t: ['Engagement · Shaun & Tina', 'Tulip season in Langley', 'A bright spring afternoon among the tulips, dressed in white and cream. No rush and no posing, just the two of them.'],
      end: ['Jenn & Erin · A quiet walk for two', 'Next issue', 'Your story could be next.', 'Weddings, engagements, surprise proposals and elopements across Vancouver and BC.', 'Book your date', 'Enter the website'] },
    fr: { skip: 'Passer l’intro', prev: 'Page précédente', next: 'Page suivante', hint: 'Touchez ou glissez pour tourner la page', aria: 'Le magazine Joenell',
      issue: 'Numéro 01 · Vancouver, C.-B. · 2026', coverH: 'Des histoires d’amour, telles qu’elles ont été vécues.',
      cl: ['Le mariage : un jardin en automne', 'Elle a dit oui à Bowen Lookout', 'Stanley Park, puis la plage au coucher du soleil', 'La saison des tulipes à Langley'],
      contents: 'Dans ce numéro', noteK: 'Un mot du photographe',
      note: 'Bonjour, je suis Joenell. Je photographie des mariages, des fiançailles, des demandes surprises et des élopements à Vancouver et partout en Colombie-Britannique. Je garde les choses calmes et naturelles, pour que vos photos ressemblent à ce que vous avez vécu. Voici quelques histoires que des couples m’ont confiées.',
      w: ['Mariage · Chris & Lorena', 'Un mariage au jardin, en automne', 'Des derniers instants calmes des préparatifs jusqu’à une promenade dans le jardin, mari et femme.'],
      wc: ['Les préparatifs', 'Les alliances, puis une promenade dans le jardin', 'Lumière d’automne', 'Quelques minutes seuls avant le dîner'],
      p: ['Demande surprise · Jake & Hannah', 'Elle a dit oui à Bowen Lookout', 'Cypress Mountain, West Vancouver', 'Je suis resté caché tout près : Hannah n’a vu l’appareil qu’après avoir dit oui. Puis quelques portraits détendus, avec tout Howe Sound derrière eux.'],
      e: ['Fiançailles · Chris & Lorena', 'Stanley Park, puis la plage au coucher du soleil', 'Les cerisiers en fleurs de Stanley Park, puis la plage pendant que le soleil se couchait.', 'L’heure dorée'],
      t: ['Fiançailles · Shaun & Tina', 'La saison des tulipes à Langley', 'Un après-midi de printemps lumineux parmi les tulipes, en blanc et crème. Sans se presser et sans poser, juste eux deux.'],
      end: ['Jenn & Erin · Une balade à deux', 'Le prochain numéro', 'Votre histoire pourrait être la prochaine.', 'Mariages, fiançailles, demandes surprises et élopements à Vancouver et en C.-B.', 'Réserver votre date', 'Entrer sur le site'] },
    es: { skip: 'Saltar intro', prev: 'Página anterior', next: 'Página siguiente', hint: 'Toca o desliza para pasar la página', aria: 'La revista Joenell',
      issue: 'Número 01 · Vancouver, BC · 2026', coverH: 'Historias de amor, tal como se vivieron.',
      cl: ['La boda: un jardín en otoño', 'Dijo que sí en Bowen Lookout', 'Stanley Park y luego la playa al atardecer', 'Temporada de tulipanes en Langley'],
      contents: 'En este número', noteK: 'Una nota del fotógrafo',
      note: 'Hola, soy Joenell. Fotografío bodas, compromisos, pedidas sorpresa y fugas románticas en Vancouver y en toda Columbia Británica. Mantengo todo tranquilo y natural, para que tus fotos se parezcan a cómo se sintió el día. Aquí tienes algunas de las historias que las parejas me han confiado.',
      w: ['Boda · Chris & Lorena', 'Una boda en el jardín, en otoño', 'Desde los últimos minutos tranquilos de los preparativos hasta un paseo por el jardín como marido y mujer.'],
      wc: ['Los preparativos', 'Los anillos y luego un paseo por el jardín', 'Luz de otoño', 'Unos minutos a solas antes de la cena'],
      p: ['Pedida sorpresa · Jake & Hannah', 'Dijo que sí en Bowen Lookout', 'Cypress Mountain, West Vancouver', 'Me quedé escondido cerca, así que Hannah no vio la cámara hasta que dijo que sí. Después, unos retratos relajados con todo Howe Sound detrás.'],
      e: ['Compromiso · Chris & Lorena', 'Stanley Park y luego la playa al atardecer', 'Cerezos en flor en Stanley Park y después la playa mientras se ponía el sol.', 'La hora dorada'],
      t: ['Compromiso · Shaun & Tina', 'Temporada de tulipanes en Langley', 'Una tarde luminosa de primavera entre tulipanes, vestidos de blanco y crema. Sin prisas y sin posar, solo ellos dos.'],
      end: ['Jenn & Erin · Un paseo tranquilo para dos', 'El próximo número', 'Tu historia podría ser la próxima.', 'Bodas, compromisos, pedidas sorpresa y fugas románticas en Vancouver y BC.', 'Reserva tu fecha', 'Entrar al sitio'] },
    zh: { skip: '跳过', prev: '上一页', next: '下一页', hint: '轻触或滑动翻页', aria: 'Joenell 杂志',
      issue: '第 01 期 · 卑诗省温哥华 · 2026', coverH: '爱的故事，如当时的感受。',
      cl: ['婚礼：秋日花园', '她在 Bowen Lookout 说了“我愿意”', '斯坦利公园，然后是日落海滩', '兰里的郁金香季'],
      contents: '本期内容', noteK: '摄影师的话',
      note: '你好，我是 Joenell。我在温哥华和卑诗省各地拍摄婚礼、订婚、惊喜求婚和私奔婚礼。我让一切保持平静自然，让照片呈现那一天真实的感受。以下是几对新人托付给我的故事。',
      w: ['婚礼 · Chris & Lorena', '秋日花园婚礼', '从准备时最后的安静时刻，到以夫妻身份在花园中漫步。'],
      wc: ['准备时刻', '交换戒指，然后在花园漫步', '秋日光线', '晚宴前独处的几分钟'],
      p: ['惊喜求婚 · Jake & Hannah', '她在 Bowen Lookout 说了“我愿意”', '西温哥华 Cypress 山', '我躲在附近，所以 Hannah 直到说“我愿意”才看到相机。之后，以整个豪湾为背景拍了几张轻松的合影。'],
      e: ['订婚 · Chris & Lorena', '斯坦利公园，然后是日落海滩', '斯坦利公园的樱花，然后在日落时分来到海滩。', '黄金时刻'],
      t: ['订婚 · Shaun & Tina', '兰里的郁金香季', '一个明媚的春日午后，身着白色与米色，漫步在郁金香之间。不赶时间，不摆姿势，只有他们两人。'],
      end: ['Jenn & Erin · 两个人的安静漫步', '下一期', '下一个故事可能是你们的。', '温哥华及卑诗省的婚礼、订婚、惊喜求婚和私奔婚礼。', '预订日期', '进入网站'] },
    pa: { skip: 'ਇੰਟਰੋ ਛੱਡੋ', prev: 'ਪਿਛਲਾ ਪੰਨਾ', next: 'ਅਗਲਾ ਪੰਨਾ', hint: 'ਪੰਨਾ ਪਲਟਣ ਲਈ ਛੂਹੋ ਜਾਂ ਸਵਾਈਪ ਕਰੋ', aria: 'Joenell ਮੈਗਜ਼ੀਨ',
      issue: 'ਅੰਕ 01 · ਵੈਨਕੂਵਰ, BC · 2026', coverH: 'ਪਿਆਰ ਦੀਆਂ ਕਹਾਣੀਆਂ, ਜਿਵੇਂ ਉਹ ਮਹਿਸੂਸ ਹੋਈਆਂ।',
      cl: ['ਵਿਆਹ: ਪਤਝੜ ਵਿੱਚ ਇੱਕ ਬਗੀਚਾ', 'Bowen Lookout ਤੇ ਉਸਨੇ ਹਾਂ ਕਿਹਾ', 'Stanley Park, ਫਿਰ ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ ਬੀਚ', 'Langley ਵਿੱਚ ਟਿਊਲਿਪ ਦਾ ਮੌਸਮ'],
      contents: 'ਇਸ ਅੰਕ ਵਿੱਚ', noteK: 'ਫੋਟੋਗ੍ਰਾਫਰ ਵੱਲੋਂ',
      note: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ Joenell ਹਾਂ। ਮੈਂ ਵੈਨਕੂਵਰ ਅਤੇ ਪੂਰੇ ਬ੍ਰਿਟਿਸ਼ ਕੋਲੰਬੀਆ ਵਿੱਚ ਵਿਆਹ, ਮੰਗਣੀ, ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ ਅਤੇ ਇਲੋਪਮੈਂਟ ਦੀਆਂ ਫੋਟੋਆਂ ਖਿੱਚਦਾ ਹਾਂ। ਮੈਂ ਸਭ ਕੁਝ ਸ਼ਾਂਤ ਅਤੇ ਕੁਦਰਤੀ ਰੱਖਦਾ ਹਾਂ, ਤਾਂ ਜੋ ਤੁਹਾਡੀਆਂ ਫੋਟੋਆਂ ਉਸ ਦਿਨ ਦੇ ਅਹਿਸਾਸ ਵਰਗੀਆਂ ਲੱਗਣ। ਇੱਥੇ ਕੁਝ ਕਹਾਣੀਆਂ ਹਨ ਜੋ ਜੋੜਿਆਂ ਨੇ ਮੈਨੂੰ ਸੌਂਪੀਆਂ।',
      w: ['ਵਿਆਹ · Chris & Lorena', 'ਪਤਝੜ ਵਿੱਚ ਬਗੀਚੇ ਦਾ ਵਿਆਹ', 'ਤਿਆਰ ਹੋਣ ਦੇ ਆਖਰੀ ਸ਼ਾਂਤ ਪਲਾਂ ਤੋਂ ਲੈ ਕੇ ਪਤੀ-ਪਤਨੀ ਵਜੋਂ ਬਗੀਚੇ ਵਿੱਚ ਸੈਰ ਤੱਕ।'],
      wc: ['ਤਿਆਰੀ', 'ਮੁੰਦਰੀਆਂ, ਫਿਰ ਬਗੀਚੇ ਵਿੱਚ ਸੈਰ', 'ਪਤਝੜ ਦੀ ਰੌਸ਼ਨੀ', 'ਰਾਤ ਦੇ ਖਾਣੇ ਤੋਂ ਪਹਿਲਾਂ ਕੁਝ ਪਲ ਇਕੱਲੇ'],
      p: ['ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ · Jake & Hannah', 'Bowen Lookout ਤੇ ਉਸਨੇ ਹਾਂ ਕਿਹਾ', 'Cypress Mountain, ਵੈਸਟ ਵੈਨਕੂਵਰ', 'ਮੈਂ ਨੇੜੇ ਲੁਕਿਆ ਰਿਹਾ, ਇਸ ਲਈ Hannah ਨੇ ਹਾਂ ਕਹਿਣ ਤੱਕ ਕੈਮਰਾ ਨਹੀਂ ਦੇਖਿਆ। ਫਿਰ ਪਿੱਛੇ ਪੂਰੇ Howe Sound ਨਾਲ ਕੁਝ ਆਰਾਮਦਾਇਕ ਪੋਰਟਰੇਟ।'],
      e: ['ਮੰਗਣੀ · Chris & Lorena', 'Stanley Park, ਫਿਰ ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ ਬੀਚ', 'Stanley Park ਵਿੱਚ ਚੈਰੀ ਦੇ ਫੁੱਲ, ਫਿਰ ਸੂਰਜ ਡੁੱਬਦੇ ਵੇਲੇ ਬੀਚ ਵੱਲ।', 'ਸੁਨਹਿਰੀ ਘੰਟਾ'],
      t: ['ਮੰਗਣੀ · Shaun & Tina', 'Langley ਵਿੱਚ ਟਿਊਲਿਪ ਦਾ ਮੌਸਮ', 'ਟਿਊਲਿਪਾਂ ਵਿਚਕਾਰ ਬਸੰਤ ਦੀ ਇੱਕ ਚਮਕਦਾਰ ਦੁਪਹਿਰ, ਚਿੱਟੇ ਅਤੇ ਕਰੀਮ ਰੰਗ ਵਿੱਚ। ਕੋਈ ਕਾਹਲੀ ਨਹੀਂ, ਕੋਈ ਪੋਜ਼ ਨਹੀਂ, ਬੱਸ ਉਹ ਦੋਵੇਂ।'],
      end: ['Jenn & Erin · ਦੋਵਾਂ ਲਈ ਇੱਕ ਸ਼ਾਂਤ ਸੈਰ', 'ਅਗਲਾ ਅੰਕ', 'ਅਗਲੀ ਕਹਾਣੀ ਤੁਹਾਡੀ ਹੋ ਸਕਦੀ ਹੈ।', 'ਵੈਨਕੂਵਰ ਅਤੇ BC ਵਿੱਚ ਵਿਆਹ, ਮੰਗਣੀ, ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ ਅਤੇ ਇਲੋਪਮੈਂਟ।', 'ਆਪਣੀ ਤਾਰੀਖ਼ ਬੁੱਕ ਕਰੋ', 'ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਜਾਓ'] }
  };
  var t = T[lang] || T.en;

  /* ---------- page builders ---------- */
  function src(n) { return '/images/alb-' + n + '.jpg?v=' + V; }
  function im(n, fx, fy, alt) { return '<img src="' + src(n) + '" alt="' + (alt || '') + '" draggable="false" decoding="async" style="object-position:' + fx + '% ' + fy + '%">'; }
  function fol(i) { return '<span class="jm-fol' + (i % 2 ? ' r' : '') + '">JOENELL <b>' + (i < 9 ? '0' : '') + (i + 1) + '</b></span>'; }
  function photo(n, fx, fy, alt, cap) {
    return function (i) { return '<div class="jm-pg jm-photo">' + im(n, fx, fy, alt) + (cap ? '<span class="jm-cap">' + cap + '</span>' : '') + fol(i) + '</div>'; };
  }
  function story(k, h, sub, p, pics, drop) {
    return function (i) {
      return '<div class="jm-pg jm-story"><div class="jm-tx"><span class="jm-k">' + k + '</span><h2>' + h + '</h2>' + (sub ? '<span class="jm-sub">' + sub + '</span>' : '') +
        '<p' + (drop ? ' class="jm-drop"' : '') + '>' + p + '</p></div><div class="jm-pics n' + pics.length + '">' +
        pics.map(function (x) { return '<figure><span class="jm-im">' + im(x[0], x[1], x[2], x[3]) + '</span>' + (x[4] ? '<figcaption>' + x[4] + '</figcaption>' : '') + '</figure>'; }).join('') +
        '</div>' + fol(i) + '</div>';
    };
  }
  function stack(a, b, cap) {
    return function (i) {
      return '<div class="jm-pg jm-stack"><span class="jm-im">' + im(a[0], a[1], a[2], a[3]) + '</span><span class="jm-im">' + im(b[0], b[1], b[2], b[3]) + '</span>' + (cap ? '<span class="jm-cap dk">' + cap + '</span>' : '') + fol(i) + '</div>';
    };
  }
  var P = [
    function () {
      return '<div class="jm-pg jm-cover">' + im('cl-wedding-kiss', 55, 30, t.w[1]) +
        '<div class="jm-mast"><span class="jm-iss">' + t.issue + '</span><span class="jm-logo">JOENELL</span><span class="jm-ph">Photography</span></div>' +
        '<div class="jm-cl"><h1>' + t.coverH + '</h1><ul>' + t.cl.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul></div></div>';
    },
    function (i) {
      var pg = [3, 7, 9, 11];
      return '<div class="jm-pg jm-toc"><span class="jm-k">' + t.contents + '</span><ol>' +
        t.cl.map(function (c, j) { return '<li><b>' + (pg[j] < 10 ? '0' : '') + pg[j] + '</b><span>' + c + '</span></li>'; }).join('') +
        '</ol><hr><span class="jm-k">' + t.noteK + '</span><p class="jm-note">' + t.note + '</p><span class="jm-sig">Joenell</span>' + fol(i) + '</div>';
    },
    photo('cl-wedding-veil', 55, 30, t.wc[0], t.wc[0]),
    story(t.w[0], t.w[1], '', t.w[2], [['cl-wedding-rings', 55, 50, t.wc[1]], ['cl-wedding-path', 42, 45, t.wc[1], t.wc[1]]], true),
    photo('cl-wedding-kiss-w', 50, 35, t.w[1]),
    stack(['cl-wedding-dip', 50, 45, t.wc[3]], ['cl-wedding-portrait-w', 50, 35, t.wc[2]], t.wc[2]),
    story(t.p[0], t.p[1], t.p[2], t.p[3], [['jh-lookout', 58, 60, t.p[1]]], true),
    photo('jh-kiss', 50, 30, t.p[1]),
    photo('cl-engagement-blossom-gaze', 50, 28, t.e[1]),
    story(t.e[0], t.e[1], '', t.e[2], [['cl-engagement-beach', 45, 40, t.e[3], t.e[3]]], true),
    story(t.t[0], t.t[1], '', t.t[2], [['st-cover', 50, 55, t.t[1]]], true),
    photo('st-03', 50, 30, t.t[1]),
    photo('je-1', 50, 30, t.end[0], t.end[0]),
    function (i) {
      return '<div class="jm-pg jm-end"><span class="jm-k">' + t.end[1] + '</span><h2>' + t.end[2] + '</h2><p>' + t.end[3] + '</p>' +
        '<a class="jm-btn" href="' + base + '/contact" data-jm="book">' + t.end[4] + '</a><button type="button" class="jm-enter" data-jm="enter">' + t.end[5] + ' <i aria-hidden="true">&rarr;</i></button>' +
        '<span class="jm-logo sm">JOENELL</span>' + fol(i) + '</div>';
    }
  ];
  var NP = P.length;

  /* ---------- styles ---------- */
  var css = 'html.jm-on body{overflow:hidden}' +
    '.jm{position:fixed;inset:0;z-index:2147483000;background:radial-gradient(120% 90% at 50% 40%,#2a2723 0%,#141311 70%);color:#F3EEE7;display:flex;flex-direction:column;font-family:Jost,system-ui,sans-serif;visibility:visible;transition:opacity .8s ease;-webkit-tap-highlight-color:transparent}' +
    '.jm.out{opacity:0;pointer-events:none}.jm.out .jm-book{transform:scale(.86) translateY(30px);opacity:.2}' +
    '.jm-top{display:flex;align-items:center;justify-content:space-between;height:54px;padding:0 18px;flex:0 0 auto}' +
    '.jm-top .jm-brand{width:112px;height:28px;background:url(/assets/logo-word-on-dark.svg) no-repeat left center/contain;opacity:.9}' +
    '.jm-count{font-size:12px;letter-spacing:.18em;color:#bdb4a6}' +
    '.jm-skip{background:none;border:1px solid rgba(243,238,231,.35);color:#F3EEE7;border-radius:99px;padding:8px 14px;font:500 13px Jost,system-ui,sans-serif;letter-spacing:.04em;cursor:pointer}.jm-skip:hover{background:rgba(243,238,231,.12)}' +
    '.jm-stage{flex:1 1 auto;display:flex;align-items:center;justify-content:center;perspective:2400px;min-height:0;touch-action:pan-y}' +
    '.jm-book{position:relative;transition:transform .8s cubic-bezier(.2,.7,.2,1),opacity .8s;box-shadow:0 30px 60px -20px rgba(0,0,0,.7)}' +
    '.jm-side{position:absolute;top:0;height:100%;overflow:hidden;background:#FAF8F4}' +
    '.jm-book.spread .jm-l{left:0;box-shadow:inset -24px 0 30px -24px rgba(0,0,0,.45)}.jm-book.spread .jm-r{right:0}' +
    '.jm-book.single .jm-l{display:none}' +
    '.jm-leaf{position:absolute;top:0;height:100%;transform-style:preserve-3d;transition:transform .95s cubic-bezier(.45,.05,.25,1);z-index:5}' +
    '.jm-leaf.r{transform-origin:left center}.jm-leaf.l{left:0;transform-origin:right center}.jm-leaf.s{left:0;transform-origin:left center;transition:transform .8s cubic-bezier(.45,.05,.25,1),opacity .8s}' +
    '.jm-face{position:absolute;inset:0;overflow:hidden;background:#FAF8F4;-webkit-backface-visibility:hidden;backface-visibility:hidden}.jm-face.b{transform:rotateY(180deg)}' +
    '.jm-face:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,0) 40%);opacity:0;transition:opacity .95s;z-index:4}.jm-leaf.go .jm-face:after{opacity:1}' +
    '.jm-pg{position:absolute;inset:0;overflow:hidden;background:#FAF8F4;color:#2B2926;font-size:clamp(12px,calc(var(--u)*3.15),17px);line-height:1.55}' +
    '.jm-pg img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none}' +
    '.jm-fol{position:absolute;bottom:1.1em;left:1.6em;font-size:.62em;letter-spacing:.22em;color:#8A8278;z-index:3}.jm-fol.r{left:auto;right:1.6em}.jm-fol b{font-weight:500;color:#2B2926}' +
    '.jm-photo .jm-fol{display:none}' +
    '.jm-photo img{position:absolute;inset:0}.jm-cap{position:absolute;left:1.6em;bottom:2.6em;z-index:3;color:#fff;font:italic 400 1.05em "Bodoni Moda",Georgia,serif;text-shadow:0 1px 8px rgba(0,0,0,.55);max-width:58%}' +
    '.jm-cap.dk{position:static;display:block;color:#4A453F;text-shadow:none;padding:.5em 1.6em 0;font-size:.95em}' +
    '.jm-cover img{position:absolute;left:0;right:0;bottom:0;top:22%;height:78%}.jm-cover:after{content:"";position:absolute;left:0;right:0;bottom:0;height:46%;z-index:1;pointer-events:none;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.66))}' +
    '.jm-mast{position:absolute;top:0;left:0;right:0;height:22%;z-index:2;text-align:center;color:#2B2926;display:flex;flex-direction:column;justify-content:center}.jm-mast .jm-iss{color:#8A8278}' +
    '.jm-iss{display:block;font-size:.62em;letter-spacing:.28em;text-transform:uppercase;opacity:.9}' +
    '.jm-logo{display:block;font:400 calc(var(--u)*13.5) "Bodoni Moda",Didot,Georgia,serif;letter-spacing:.06em;line-height:1;margin-top:.12em}' +
    '.jm-ph{display:block;font:italic 400 1em "Bodoni Moda",Georgia,serif;margin-top:.05em;letter-spacing:.04em;color:#6B645B}' +
    '.jm-cl{position:absolute;left:1.6em;right:1.6em;bottom:2.8em;z-index:2;color:#fff}' +
    '.jm-cl h1{font:italic 400 2.05em/1.08 "Bodoni Moda",Georgia,serif;margin:0 0 .55em;max-width:12em;text-shadow:0 2px 14px rgba(0,0,0,.4)}' +
    '.jm-cl ul{list-style:none;margin:0;padding:0;border-top:1px solid rgba(255,255,255,.45)}.jm-cl li{font-size:.8em;letter-spacing:.06em;padding:.45em 0;border-bottom:1px solid rgba(255,255,255,.22)}' +
    '.jm-k{display:block;font-size:.66em;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:#B8955E}' +
    '.jm-toc{padding:2.4em 1.8em 3em;display:flex;flex-direction:column}.jm-toc ol{list-style:none;margin:.9em 0 0;padding:0}' +
    '.jm-toc li{display:flex;gap:.9em;align-items:baseline;padding:.55em 0;border-bottom:1px solid #E3DCCF;font:400 1.25em/1.25 "Bodoni Moda",Georgia,serif}.jm-toc li b{font:500 .62em Jost,sans-serif;letter-spacing:.12em;color:#B8955E;flex:0 0 auto}' +
    '.jm-toc hr{border:0;border-top:1px solid #2B2926;width:3em;margin:auto 0 1.1em}' +
    '.jm-note{font:italic 400 1.04em/1.6 "Bodoni Moda",Georgia,serif;color:#4A453F;margin:.6em 0 .4em}.jm-sig{font:italic 400 1.5em "Bodoni Moda",Georgia,serif;color:#2B2926}' +
    '.jm-story{display:flex;flex-direction:column;padding:2.2em 1.8em 3em}.jm-tx{flex:0 0 auto}' +
    '.jm-story h2,.jm-end h2{font:400 1.95em/1.1 "Bodoni Moda",Didot,Georgia,serif;margin:.35em 0 .25em;color:#2B2926}' +
    '.jm-sub{display:block;font:italic 400 .95em "Bodoni Moda",Georgia,serif;color:#6B645B;margin-bottom:.3em}.jm-story p{margin:.6em 0 1em;color:#4A453F}' +
    '.jm-drop:first-letter{float:left;font:400 3.3em/.82 "Bodoni Moda",Georgia,serif;margin:.06em .1em 0 0;color:#2B2926}' +
    '.jm-pics{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:.7em}.jm-pics figure{margin:0;flex:1 1 0;min-height:0;display:flex;flex-direction:column}' +
    '.jm-im{position:relative;display:block;flex:1 1 auto;min-height:0;overflow:hidden}.jm-pics figcaption{font:italic 400 .85em "Bodoni Moda",Georgia,serif;color:#6B645B;padding-top:.35em}' +
    '.jm-stack{display:flex;flex-direction:column;gap:.6em;padding:1.6em 1.6em 3em}.jm-stack .jm-im{flex:1 1 0}' +
    '.jm-end{display:flex;flex-direction:column;justify-content:center;padding:2.4em 2em 3.4em;text-align:left}.jm-end p{color:#4A453F;margin:.4em 0 1.6em}' +
    '.jm-btn{display:inline-block;align-self:flex-start;background:#3E4A3D;color:#fff;text-decoration:none;padding:.9em 1.6em;border-radius:99px;font-weight:500;letter-spacing:.03em}.jm-btn:hover{background:#2F392E}' +
    '.jm-enter{align-self:flex-start;margin-top:1em;background:none;border:0;border-bottom:1px solid #2B2926;padding:.2em 0;font:500 1em Jost,sans-serif;color:#2B2926;cursor:pointer}' +
    '.jm-logo.sm{font-size:2.2em;color:#2B2926;margin-top:auto;letter-spacing:.08em}' +
    '.jm-bot{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:16px;height:64px;padding:0 16px}' +
    '.jm-nav{width:44px;height:44px;border-radius:50%;border:1px solid rgba(243,238,231,.35);background:none;color:#F3EEE7;font-size:24px;line-height:1;cursor:pointer}.jm-nav:disabled{opacity:.3;cursor:default}.jm-nav:not(:disabled):hover{background:rgba(243,238,231,.12)}' +
    '.jm-prog{flex:0 1 260px;height:2px;background:rgba(243,238,231,.2);border-radius:2px;overflow:hidden}.jm-prog i{display:block;height:100%;width:0;background:#C9A27E}' +
    '.jm-hint{position:absolute;bottom:66px;left:0;right:0;text-align:center;font-size:12px;color:#bdb4a6;letter-spacing:.06em;pointer-events:none;transition:opacity .6s}.jm-hint.hide{opacity:0}' +
    '@media (prefers-reduced-motion:reduce){.jm-leaf,.jm-book,.jm{transition:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- markup ---------- */
  var el = document.createElement('div');
  el.className = 'jm'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', t.aria);
  el.innerHTML = '<div class="jm-top"><span class="jm-brand" aria-hidden="true"></span><span class="jm-count" aria-live="polite"></span><button type="button" class="jm-skip">' + t.skip + ' &times;</button></div>' +
    '<div class="jm-stage"><div class="jm-book"><div class="jm-side jm-l"></div><div class="jm-side jm-r"></div></div></div>' +
    '<div class="jm-bot"><button type="button" class="jm-nav jm-pv" aria-label="' + t.prev + '">&#8249;</button><span class="jm-prog"><i></i></span><button type="button" class="jm-nav jm-nx" aria-label="' + t.next + '">&#8250;</button></div>';
  var book = el.querySelector('.jm-book'), L = el.querySelector('.jm-l'), R = el.querySelector('.jm-r'), cnt = el.querySelector('.jm-count'),
    bar = el.querySelector('.jm-prog i'), bp = el.querySelector('.jm-pv'), bn = el.querySelector('.jm-nx');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mode = '', W = 0, Hh = 0, pos = 0, busy = false, timer = null, hold = false, done = false, DUR = 5600;
  function gt(n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} }

  function views() { return mode === 'spread' ? NP / 2 : NP; }
  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight, ah = vh - 54 - 64 - 14, m;
    if (vw >= 900 && vw / vh > 1.05) {
      m = 'spread'; Hh = Math.min(ah, (vw - 140) / 2 * 4 / 3); W = Math.round(Hh * 3 / 4); Hh = Math.round(Hh);
    } else {
      m = 'single'; Hh = Math.round(ah); W = Math.round(Math.min(vw - 28, Hh * 0.8));
    }
    if (m !== mode) { if (mode === 'spread' && m === 'single') pos = pos * 2; else if (mode === 'single' && m === 'spread') pos = Math.floor(pos / 2); mode = m; }
    book.className = 'jm-book ' + mode;
    book.style.cssText = 'width:' + (mode === 'spread' ? 2 * W : W) + 'px;height:' + Hh + 'px;--u:' + (W / 100) + 'px';
    L.style.width = R.style.width = W + 'px';
    if (mode === 'single') R.style.left = '0'; else R.style.left = W + 'px';
    show();
  }
  function pg(i) { return i >= 0 && i < NP ? P[i](i) : ''; }
  function show() {
    if (mode === 'spread') { L.innerHTML = pg(2 * pos); R.innerHTML = pg(2 * pos + 1); } else { R.innerHTML = pg(pos); }
    ui(); preload();
  }
  function ui() {
    var n = views();
    cnt.textContent = (pos + 1) + ' / ' + n;
    bp.disabled = pos === 0;
    restart();
  }
  function preload() {
    var a = mode === 'spread' ? 2 * pos + 2 : pos + 1, b = a + (mode === 'spread' ? 4 : 2);
    for (var i = a; i < b && i < NP; i++) { var d = document.createElement('div'); d.innerHTML = pg(i); [].forEach.call(d.querySelectorAll('img'), function (x) { var j = new Image(); j.src = x.getAttribute('src'); }); }
  }
  function restart() {
    clearTimeout(timer); bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
    if (hold || done) return;
    bar.style.transition = 'width ' + DUR + 'ms linear'; bar.style.width = '100%';
    timer = setTimeout(function () { turn(1, true); }, DUR);
  }
  function leaf(cls, front, back, left) {
    var lf = document.createElement('div'); lf.className = 'jm-leaf ' + cls;
    lf.style.width = W + 'px'; if (left != null) lf.style.left = left + 'px';
    lf.innerHTML = '<div class="jm-face f">' + front + '</div>' + (back != null ? '<div class="jm-face b">' + back + '</div>' : '');
    book.appendChild(lf); return lf;
  }
  function animate(lf, from, to, fade, cb) {
    lf.style.transform = from; if (fade) lf.style.opacity = fade[0];
    void lf.offsetWidth; lf.classList.add('go');
    lf.style.transform = to; if (fade) lf.style.opacity = fade[1];
    var fin = false; function end() { if (fin) return; fin = true; cb(); lf.remove(); busy = false; }
    lf.addEventListener('transitionend', function (e) { if (e.propertyName === 'transform') end(); });
    setTimeout(end, 1200);
  }
  function turn(dir, auto) {
    if (busy || done) return;
    var nx = pos + dir;
    if (nx < 0) return;
    if (nx >= views()) { finish(auto ? 'complete' : 'complete'); return; }
    if (reduce) { pos = nx; show(); return; }
    busy = true;
    if (mode === 'spread') {
      if (dir > 0) {
        var lf = leaf('r', pg(2 * pos + 1), pg(2 * nx), W); R.innerHTML = pg(2 * nx + 1);
        animate(lf, 'rotateY(0deg)', 'rotateY(-180deg)', null, function () { L.innerHTML = pg(2 * nx); });
      } else {
        var lb = leaf('l', pg(2 * pos), pg(2 * nx + 1), 0); L.innerHTML = pg(2 * nx);
        animate(lb, 'rotateY(0deg)', 'rotateY(180deg)', null, function () { R.innerHTML = pg(2 * nx + 1); });
      }
    } else {
      if (dir > 0) {
        var ls = leaf('s', pg(pos), null, 0); R.innerHTML = pg(nx);
        animate(ls, 'rotateY(0deg)', 'rotateY(-110deg)', [1, 0], function () {});
      } else {
        var lp = leaf('s', pg(nx), null, 0);
        animate(lp, 'rotateY(-110deg)', 'rotateY(0deg)', [0, 1], function () { R.innerHTML = pg(nx); });
      }
    }
    pos = nx; ui(); preload();
  }
  function finish(how) {
    if (done) return; done = true; clearTimeout(timer);
    try { localStorage.setItem('jm-seen', String(Date.now())); } catch (e) {}
    gt('intro_' + how, { page: pos + 1 });
    el.classList.add('out');
    document.removeEventListener('keydown', key);
    setTimeout(function () { el.remove(); H.classList.remove('jm-on'); window.scrollTo(0, 0); window.dispatchEvent(new Event('resize')); }, reduce ? 0 : 820);
  }
  function key(e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); turn(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn(-1); }
    else if (e.key === 'Escape') finish('skip');
  }

  el.querySelector('.jm-skip').addEventListener('click', function () { finish('skip'); });
  bn.addEventListener('click', function () { turn(1); });
  bp.addEventListener('click', function () { turn(-1); });
  el.addEventListener('click', function (e) {
    var a = e.target.closest('[data-jm]');
    if (a) { if (a.getAttribute('data-jm') === 'enter') finish('complete'); else { try { localStorage.setItem('jm-seen', String(Date.now())); } catch (x) {} gt('intro_book'); } }
  });
  var sx = 0, sy = 0, st0 = 0;
  book.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; st0 = Date.now(); });
  book.addEventListener('pointerup', function (e) {
    if (e.target.closest('a,button')) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { turn(dx < 0 ? 1 : -1); return; }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && Date.now() - st0 < 600) {
      var r = book.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      turn(x < (mode === 'spread' ? 0.5 : 0.3) ? -1 : 1);
    }
  });
  book.addEventListener('mouseenter', function () { hold = true; restart(); });
  book.addEventListener('mouseleave', function () { hold = false; restart(); });
  document.addEventListener('keydown', key);
  var rt; window.addEventListener('resize', function () { if (done) return; clearTimeout(rt); rt = setTimeout(layout, 120); });

  function start() {
    document.body.appendChild(el);
    layout();
    el.querySelector('.jm-skip').focus({ preventScroll: true });
    gt('intro_view');
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
