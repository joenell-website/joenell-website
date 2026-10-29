"""Create a Journal post from tools/posts/<name>.json, using the Whistler guide as the page template.
Also: adds its card to /blog (top), to its category pages, to the sitemap, and links it from the
previous post's 'Next guide' nav. Usage: python3 tools/new_post.py tools/posts/stanley-park.json"""
import re, json, sys, html as H
from PIL import Image
P = json.load(open(sys.argv[1]))
e = lambda x: H.escape(x, quote=True)
slug = P['slug']; url = f'https://www.joenellphotography.ca/blog/{slug}'
def ids(t): return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:60]
def dims(n):
    w, h = Image.open(f'site/images/{n}-sm.jpg').size; W = Image.open(f'site/images/{n}.jpg').size[0]; return w, h, W

T = open('site/blog/whistler-wedding-photography-guide.html').read()
s = T
# ---- head
s = re.sub(r'<title>.*?</title>', lambda m: f'<title>{e(P["seo_title"])}</title>', s, count=1)
def meta(s, key, val):
    return re.sub(r'(<meta[^>]*' + key + r'[^>]*content=")[^"]*(")', lambda m: m.group(1) + e(val) + m.group(2), s)
for k in ['name="description"', 'property="og:description"']: s = meta(s, k, P['desc'])
s = meta(s, 'property="og:title"', P['title'])
s = meta(s, 'property="article:published_time"', P['date'])
hn, hfx, hfy, halt = P['hero']
s = re.sub(r'(<meta property="og:image" content=")[^"]*', lambda m: m.group(1) + f'https://www.joenellphotography.ca/images/{hn}.jpg', s)
s = re.sub(r'(<meta name="twitter:image" content=")[^"]*', lambda m: m.group(1) + f'https://www.joenellphotography.ca/images/{hn}.jpg', s)
s = meta(s, 'property="og:image:alt"', halt)
s = s.replace('/blog/whistler-wedding-photography-guide"', f'/blog/{slug}"')  # canonical + og:url
# ---- JSON-LD (replace all)
s = re.sub(r'\n?<script type="application/ld\+json">.*?</script>\s*', '\n', s, flags=re.S)
ld = [
 {"@context": "https://schema.org", "@type": "BlogPosting", "headline": P['title'], "description": P['desc'], "image": f'https://www.joenellphotography.ca/images/{hn}.jpg', "datePublished": P['date'], "dateModified": P['date'], "author": {"@type": "Person", "name": "Joenell", "url": "https://www.joenellphotography.ca/"}, "publisher": {"@type": "Organization", "name": "Joenell Photography", "logo": {"@type": "ImageObject", "url": "https://www.joenellphotography.ca/assets/icon-512.png"}}, "mainEntityOfPage": url, "keywords": ", ".join(P['tags']), "articleSection": P['cats'][0]},
 {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.joenellphotography.ca/"}, {"@type": "ListItem", "position": 2, "name": "Journal", "item": "https://www.joenellphotography.ca/blog"}, {"@type": "ListItem", "position": 3, "name": P['title'], "item": url}]},
 {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in P['faq']]}]
s = s.replace('</head>', ''.join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + '</script>' for x in ld) + '\n</head>', 1)
# ---- article
w, h, W = dims(hn)
faq_html = ''.join(f'<h3 id="{ids(q)}">{e(q)}</h3>\n<p>{e(a)}</p>\n' for q, a in P['faq'])
prose = P['prose'].replace('{FAQ}', faq_html.strip())
toc = ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', prose))
cat = P['cats'][0]; cq = cat.replace(' ', '+')
chips = ''.join(f'<a class="chip" href="/blog/category/{c.replace(" ", "+")}">{e(c)}</a>' for c in P['cats'])
tags = ''.join(f'<a class="chip chip-tag" href="/blog/tag/{t.replace(" ", "+")}">#{e(t)}</a>' for t in P['tags'])
art = f'''<article class="post" style="padding-top:48px">
<div class="narrow"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Journal</a> / <a href="/blog/category/{cq}">{e(cat)}</a></nav>
<h1 class="post-title">{e(P['title'])}</h1>
<div class="byline"><img src="/assets/favicon.svg" alt="" width="52" height="52"><p class="meta">By Joenell · <time datetime="{P['date']}">{P['date_h']}</time> · {P['read']}</p>
<button class="copy-link" type="button" data-copy>Copy link</button></div></div>
<div class="wrap" style="max-width:1100px"><figure class="post-hero"><img src="/images/{hn}-sm.jpg?v=20261028z" srcset="/images/{hn}-sm.jpg?v=20261028z {w}w, /images/{hn}.jpg?v=20261028z {W}w" sizes="(max-width:1100px) 100vw, 1100px" width="{w}" height="{h}" alt="{e(halt)}" data-fx="{hfx}" data-fy="{hfy}" style="object-position:{hfx}% {hfy}%" fetchpriority="high" decoding="async"></figure></div>
<div class="post-layout">
<aside class="toc" aria-label="On this page"><details open><summary>On this page</summary><ol>{toc}</ol></details></aside>
<div class="prose">{prose}
<div class="cta-box"><div><h3>Planning something?</h3><p style="margin:6px 0 0;color:var(--ink-2)">Weddings from $1,000 · Elopements from $850 · Proposals $250 · Engagements $225</p></div><a class="btn btn-solid" href="/contact">Book your date</a></div>
<div class="post-topics"><p class="eyebrow">Filed under</p><p class="chips">{chips}</p><p class="chips">{tags}</p></div>
<nav class="post-nav" aria-label="More guides"><a class="pn prev" href="/blog/{P['prev'][0]}"><span class="dir">← Previous guide</span><span class="t">{e(P['prev'][1])}</span></a><span></span></nav>
</div></div></article>'''
s = re.sub(r'<article class="post".*?</article>', lambda m: art, s, count=1, flags=re.S)
# related track: drop own card if any, add the Whistler card from /blog
B = open('site/blog.html').read()
wcard = re.search(r'<a class="card post-card[^"]*" href="/blog/whistler-wedding-photography-guide".*?</a>(?=<a class="card|</div>)', B, re.S).group(0)
s = re.sub(r'(<div class="rel-track"[^>]*>)', lambda m: m.group(1) + wcard, s, count=1)
open(f'site/blog/{slug}.html', 'w').write(s)
# ---- card
cn, cfx, cfy = P['card_img']; w, h, W = dims(cn)
calt = halt if cn == hn else ''
text = ' '.join([P['title'], P['desc'], *P['tags'], *P['cats'], *re.findall(r'<h[23] id="[^"]+">(.*?)</h[23]>', prose)]).lower()
card = (f'<a class="card post-card reveal" href="/blog/{slug}" data-cats="{e("|".join(P["cats"]))}" data-text="{e(H.unescape(re.sub("<[^>]+>", "", text)))}">'
        f'<div class="ph"><img src="/images/{cn}-sm.jpg?v=20261028z" srcset="/images/{cn}-sm.jpg?v=20261028z {w}w, /images/{cn}.jpg?v=20261028z {W}w" sizes="(max-width:900px) 100vw, 33vw" width="{w}" height="{h}" alt="{e(calt)}" data-fx="{cfx}" data-fy="{cfy}" style="object-position:{cfx}% {cfy}%" loading="lazy" decoding="async"></div>'
        f'<div class="txt"><p class="eyebrow">{P["date_h"]} · {P["read"]}</p><h3>{e(P["title"])}</h3><p>{e(P["desc"])}</p><p class="chips">' + ' '.join(f'<span class="chip-sm">{e(c)}</span>' for c in P['cats'][:2]) +
        '</p><span class="read-more">Read the guide <span aria-hidden="true">→</span></span></div></a>')
def add_card(f):
    t = open(f).read()
    if f'href="/blog/{slug}"' in t: return
    t = t.replace('<div class="cards blog-grid">', '<div class="cards blog-grid">' + card, 1) if '<div class="cards blog-grid">' in t else t.replace('<div class="wrap cards blog-grid">', '<div class="wrap cards blog-grid">' + card, 1)
    t = re.sub(r'(\d+) guides<', lambda m: f'{int(m.group(1)) + 1} guides<', t, count=1)
    open(f, 'w').write(t); print('card ->', f)
add_card('site/blog.html')
for c in P['cats']: add_card(f'site/blog/category/{c.replace(" ", "+")}.html')
# new post is the newest: previous newest post gets a "Next guide" link to it
pf = f'site/blog/{P["prev"][0]}.html'; t = open(pf).read()
t = t.replace('</span></a><span></span></nav>', f'</span></a><a class="pn next" href="/blog/{slug}"><span class="dir">Next guide →</span><span class="t">{e(P["title"])}</span></a></nav>', 1)  # newest post had no "next"
open(pf, 'w').write(t)
# sitemap
sm = open('site/sitemap.xml').read()
if f'<loc>{url}</loc>' not in sm:
    sm = sm.replace('  <url><loc>https://www.joenellphotography.ca/blog/', f'  <url><loc>{url}</loc><lastmod>{P["date"]}</lastmod></url>\n  <url><loc>https://www.joenellphotography.ca/blog/', 1)
    open('site/sitemap.xml', 'w').write(sm)
print('post ok', f'site/blog/{slug}.html')
