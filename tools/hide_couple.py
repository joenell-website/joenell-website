"""Pinky & Shika (owner request, Nov 1 2026): their photos appear ONLY in the Journal (/blog), and their names
appear nowhere on the site. Step 1: outside /blog, swap each of their photos for another couple's photo not already
on that page (portfolio pages: drop the tile). Step 2: everywhere (incl. /blog) rename the image files so the URL
carries no names, and replace name mentions in alt text, captions and review credits. Idempotent.
Usage: python3 tools/hide_couple.py"""
import re, glob, json, os, shutil
from PIL import Image

OLD = ['laugh', 'kiss', 'close']
OLDN = {k: f'whistler-pinky-shika-{k}' for k in OLD}
NEWN = {k: f'whistler-snow-couple-{k}' for k in OLD}          # renamed files (no names)
POOL = ['proposal-mountain-lookout', 'engagement-shaun-tina-01', 'proposal-bowen-kiss', 'engagement-jenn-erin-6',
        'engagement-shaun-tina-bench', 'engagement-jenn-erin-4', 'proposal-jake-hannah-yes', 'engagement-shaun-tina-04',
        'engagement-shaun-tina-10', 'engagement-shaun-tina-08',
        'engagement-shaun-tina-tulips', 'engagement-jenn-erin-7', 'couple-bench-laugh', 'vancouver-autumn-wedding-kiss', 'vancouver-garden-arbour-kiss',
        'couple-dip-kiss', 'engagement-shaun-tina-03', 'engagement-shaun-tina-02', 'proposal-jake-hannah-gaze', 'bride-bouquet', 'bride-portrait']
LANGS = {'en': '', 'fr': 'fr/', 'es': 'es/', 'zh': 'zh/', 'pa': 'pa/'}
V = '20261028z'

def lang_of(f):
    p = f[len('site/'):]
    return p.split('/')[0] if p.split('/')[0] in ('fr', 'es', 'zh', 'pa') else 'en'

def size(n, sm):
    return Image.open(f'site/images/{n}{"-sm" if sm else ""}.jpg').size

# alt text, focus point per image per language, harvested from the site itself
META = {}
for f in glob.glob('site/**/*.html', recursive=True):
    L = lang_of(f); s = open(f).read()
    for m in re.finditer(r'<img\b[^>]*>', s):
        t = m.group(0); src = re.search(r'src="/images/([a-z0-9-]+?)-sm\.jpg', t); alt = re.search(r'alt="([^"]+)"', t)
        if src and alt and src.group(1) in POOL:
            fx = re.search(r'data-fx="(\d+)"', t); fy = re.search(r'data-fy="(\d+)"', t)
            META.setdefault((L, src.group(1)), (alt.group(1), fx.group(1) if fx else '50', fy.group(1) if fy else '40'))

def retag(t, n, L):
    alt, fx, fy = META[(L, n)]
    if re.search(r'\balt=""', t) is None:
        t = re.sub(r'\balt="[^"]*"', f'alt="{alt}"', t)
    t = re.sub(r'(aria-label="[^"]*?(?::|：)\s*)[^"]*"', lambda m: m.group(1) + alt + '"', t)
    t = re.sub(r'data-fx="\d+"', f'data-fx="{fx}"', t); t = re.sub(r'data-fy="\d+"', f'data-fy="{fy}"', t)
    t = re.sub(r'object-position:\s*\d+% \d+%', f'object-position:{fx}% {fy}%', t)
    if f'/images/{n}-sm.jpg' in t and re.search(r'\bwidth="\d+"', t):
        w, h = size(n, True); t = re.sub(r'\bwidth="\d+"', f'width="{w}"', t); t = re.sub(r'\bheight="\d+"', f'height="{h}"', t)
    t = re.sub(rf'(/images/{n}-sm\.jpg\?v={V}) \d+w', lambda m: f'{m.group(1)} {size(n, True)[0]}w', t)
    t = re.sub(rf'(/images/{n}\.jpg\?v={V}) \d+w', lambda m: f'{m.group(1)} {size(n, False)[0]}w', t)
    return t

changed = []
for f in sorted(glob.glob('site/**/*.html', recursive=True)):
    if f.startswith('site/blog'):
        continue
    s = open(f).read(); o = s; L = lang_of(f)
    if 'pinky-shika' not in s:
        continue
    if os.path.basename(f) == 'gallery-1.html':                   # portfolio: drop their tiles
        s = re.sub(r'<figure\b[^>]*>(?:(?!</figure>).)*pinky-shika(?:(?!</figure>).)*</figure>', '', s, flags=re.S)
    if os.path.basename(f) == 'index.html':                        # homepage camera hero: drop their frames
        pm = re.search(r'(<script[^>]*id="lens-playlist"[^>]*>)(.*?)(</script>)', s, re.S)
        pl = [x for x in json.loads(pm.group(2)) if 'pinky-shika' not in x['src']]
        s = s[:pm.start(2)] + json.dumps(pl, ensure_ascii=False) + s[pm.end(2):]
        first = pl[0]; fn = re.search(r'/images/([a-z0-9-]+)\.jpg', first['src']).group(1)
        def hero(t, src, alt=None):
            t = re.sub(r'src="[^"]*"', f'src="{src}"', t)
            t = re.sub(r'data-fx="\d+"', f'data-fx="{first["fx"]}"', t); t = re.sub(r'data-fy="\d+"', f'data-fy="{first["fy"]}"', t)
            if alt is not None: t = re.sub(r'alt="[^"]*"', f'alt="{alt}"', t)
            return t
        s = re.sub(r'<img[^>]*data-vf[^>]*>', lambda m: hero(m.group(0), f'/images/{fn}-sm.jpg?v={V}'), s, count=1)
        s = re.sub(r'<img[^>]*class="shot on"[^>]*>', lambda m: hero(m.group(0), first['src'], first['alt']), s, count=1)
        # panels: a photo that is only in the playlist (not shown elsewhere on the page)
        rest = re.sub(r'<script[^>]*id="lens-playlist"[^>]*>.*?</script>', '', s, flags=re.S)
        used = set(re.findall(r'/images/([a-z0-9-]+?)(?:-sm)?\.jpg', rest))
    else:
        used = set(re.findall(r'/images/([a-z0-9-]+?)(?:-sm)?\.jpg', s))
    for k in OLD:
        if OLDN[k] not in s:
            continue
        cand = [p for p in POOL if p not in used and (L, p) in META]
        if not cand: print("NO CANDIDATE", f, k, sorted(used)[:60]); raise SystemExit
        n = cand[0]; used.add(n)
        s = re.sub(rf'/images/{OLDN[k]}(-sm)?\.jpg\?v=\w+', lambda m: f'/images/{n}{m.group(1) or ""}.jpg?v={V}', s)
        # fix every tag / JSON item that now points at n
        s = re.sub(r'<(?:img|button)\b[^>]*/images/' + n + r'(?:-sm)?\.jpg[^>]*>', lambda m: retag(m.group(0), n, L), s)
        def js(m):
            d = json.loads(m.group(0)); alt, fx, fy = META[(L, n)]
            d.update(alt=alt, fx=int(fx), fy=int(fy)); return json.dumps(d, ensure_ascii=False)
        s = re.sub(r'\{"src": "/images/' + n + r'\.jpg[^{}]*\}', js, s)
    if s != o:
        open(f, 'w').write(s); changed.append(f)
print('photos swapped/removed on', len(changed), 'pages')

# ---- Step 2: rename files + scrub names everywhere
for k in OLD:
    for sm in ('', '-sm'):
        a, b = f'site/images/{OLDN[k]}{sm}.jpg', f'site/images/{NEWN[k]}{sm}.jpg'
        if os.path.exists(a):
            shutil.move(a, b)
NAME_FIX = [  # (pattern, replacement) — order matters
    (r'Winter in Whistler — Pinky &amp;amp; Shika', 'Winter in Whistler'),
    (r'Pinky &amp;amp; Shika', 'a Whistler couple'), (r'Pinky &amp; Shika', 'a Whistler couple'), (r'Pinky & Shika', 'a Whistler couple'),
    (r'<strong>Pinky N\.</strong>', '<strong>Whistler couple</strong>'),
    (r'— Pinky N\., ', '— '), (r'— Pinky N\.，', '— '),
    (r'Pinky and Shika', 'The couple'), (r'Pinky et Shika', 'Le couple'), (r'Pinky y Shika', 'Ellas'),
    (r'Pinky 和 Shika', '这对情侣'), (r'Pinky ਅਤੇ Shika', 'ਦੋਵੇਂ'),
]
n_files = 0
for f in glob.glob('site/**/*.html', recursive=True) + glob.glob('site/**/*.xml', recursive=True) + glob.glob('site/**/*.json', recursive=True) + ['site/assets/site.js']:
    s = open(f).read(); o = s
    for k in OLD:
        s = s.replace(OLDN[k], NEWN[k])
    for p, r in NAME_FIX:
        s = re.sub(p, r, s)
    if s != o:
        open(f, 'w').write(s); n_files += 1
print('names/filenames scrubbed in', n_files, 'files')
left = [f for f in glob.glob('site/**/*', recursive=True) if os.path.isfile(f) and f.endswith(('.html', '.xml', '.json', '.js'))
        and re.search(r'Pinky|Shika|pinky|shika', open(f, errors='ignore').read())]
print('files still mentioning a name:', left[:10])
