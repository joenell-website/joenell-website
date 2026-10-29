"""Make a new area landing page (all 5 languages) from the Burnaby page.
Usage: python3 tools/make_area.py surrey tools/surrey_i18n.json "Surrey, BC"
Keeps the Burnaby layout/photos; swaps every area-specific text, schema, URLs,
reorders the gallery and uses a different social-share image so pages aren't duplicates."""
import re, json, sys, html as H
area, jf, served = sys.argv[1], sys.argv[2], sys.argv[3]
T = json.load(open(jf))
base = 'burnaby-wedding-photographer'
slug = f'{area}-wedding-photographer'
OG = 'couple-jenn-erin-garden'
e = lambda x: H.escape(x, quote=True)

def sub1(pat, rep, s, flags=re.S):
    n = re.subn(pat, rep, s, count=1, flags=flags)
    assert n[1] == 1, pat[:70]
    return n[0]

def meta(s, key, val):
    s = re.sub(r'(<meta[^>]*' + key + r'[^>]*content=")[^"]*(")', lambda m: m.group(1) + e(val) + m.group(2), s)
    s = re.sub(r'(<meta[^>]*content=")[^"]*("[^>]*' + key + r'[^>]*>)', lambda m: m.group(1) + e(val) + m.group(2), s)
    return s

for L, t in T.items():
    p = '' if L == 'en' else L + '/'
    s = open(f'site/{p}{base}.html').read()
    foot = s.find('<footer')
    head, body, tail = s[:foot], '', s[foot:]
    s = head
    s = sub1(r'<title>.*?</title>', lambda m: f'<title>{e(t["title"])}</title>', s)
    for k in ['name="description"', 'property="og:description"']: s = meta(s, k, t['desc'])
    s = meta(s, 'property="og:title"', t['title'])
    s = s.replace(base, slug)  # canonical, hreflang, og:url, language switcher, breadcrumb
    alt = re.search(r'/images/' + OG + r'-sm\.jpg[^>]*alt="([^"]*)"', s).group(1)
    s = s.replace('/images/engagement-shaun-tina-01.jpg"', f'/images/{OG}.jpg"')
    s = meta(s, 'property="og:image:alt"', H.unescape(alt))
    s = sub1(r'(<section[^>]*class="wed-hero".*?)<p class="eyebrow">[^<]*</p>\s*<h1 id="hero-h">.*?</h1>\s*<p class="lead">.*?</p>',
             lambda m: m.group(1) + f'<p class="eyebrow">{e(t["eyebrow"])}</p>\n<h1 id="hero-h">{t["h1"]}</h1>\n<p class="lead">{e(t["lead"])}</p>', s)
    s = sub1(r'<div class="reveal"><p class="eyebrow">[^<]*</p><h2>[^<]*</h2><p class="lead">.*?</p><p>.*?</p>',
             lambda m: f'<div class="reveal"><p class="eyebrow">{e(t["s_eyebrow"])}</p><h2>{e(t["s_h2"])}</h2><p class="lead">{e(t["s_lead"])}</p><p>{e(t["s_p"])}</p>', s)
    facts = ''.join(f'<div class="fact reveal"><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a, b in t['facts'])
    s = sub1(r'<div class="wrap facts">.*?</div></div></section>', lambda m: f'<div class="wrap facts">{facts}</div></section>', s)
    # gallery: different order than Burnaby
    def regal(m):
        figs = re.findall(r'<figure>.*?</figure>', m.group(1), re.S)
        order = [1, 5, 0, 7, 3, 6, 2, 4] if len(figs) == 8 else list(range(len(figs)))[::-1]
        return '<div class="gallery">' + ''.join(figs[i] for i in order) + '</div>\n</div></section>'
    s = sub1(r'<div class="gallery">(.*?)</div>\n</div></section>', regal, s)
    s = sub1(r'(<div class="price-box reveal">.*?<p style="margin-top:12px;color:var\(--ink-2\)">).*?(</p>)', lambda m: m.group(1) + e(t['price']) + m.group(2), s)
    s = sub1(r'(<div class="price-box reveal">.*?)<ul>.*?</ul>', lambda m: m.group(1) + '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in t['ul']) + '</ul>', s)
    fh = ''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in t['faq'])
    s = sub1(r'<div class="faq">.*?</div></div></section>', lambda m: '<div class="faq">' + fh + '</div></div></section>', s)
    svc = {"@context": "https://schema.org", "@type": "Service", "serviceType": t['service'], "provider": {"@id": "https://www.joenellphotography.ca/#business"}, "areaServed": served, "offers": {"@type": "Offer", "priceCurrency": "CAD", "price": "1000", "description": t['price']}}
    fq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in t['faq']]}
    s = sub1(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "Service".*?</script>', lambda m: '<script type="application/ld+json">' + json.dumps(svc, ensure_ascii=False) + '</script>', s)
    s = sub1(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "FAQPage".*?</script>', lambda m: '<script type="application/ld+json">' + json.dumps(fq, ensure_ascii=False) + '</script>', s)
    s = sub1(r'("@type": "ListItem", "position": 2, "name": ")[^"]*(")', lambda m: m.group(1) + t['crumb'] + m.group(2), s)
    out = s + tail
    open(f'site/{p}{slug}.html', 'w').write(out)
    main = out[out.find('<main'):out.find('</main>')]
    left = re.findall(r'(?i)burnaby|deer lake|本拿比|ਬਰਨਬੀ', out[:out.find('<footer')])
    print(L, 'ok; leftover Burnaby mentions above footer:', left)
