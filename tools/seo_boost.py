"""Add a keyword-rich how-it-works section, extra FAQs (+FAQPage schema) and a sharper meta description
to /weddings and /engagements in every language. Content: tools/seo_boost_i18n.json. Idempotent (data-seo="v1").
Usage: python3 tools/seo_boost.py"""
import json, re, html as H
C = json.load(open('tools/seo_boost_i18n.json'))
PRE = {'en': '', 'fr': '/fr', 'es': '/es', 'zh': '/zh', 'pa': '/pa'}
e = lambda x: H.escape(x, quote=True)

def section(d, P):
    steps = ''.join(f'<li><strong>{e(t)}:</strong> {e(x)}</li>' for t, x in d['steps'])
    extra = ''
    if 'h3' in d:
        extra = f'<h3>{e(d["h3"])}</h3><p>{d["where"].replace("{P}", P)}</p>'
    return (f'\n<section class="section" style="padding-top:0" data-seo="v1"><div class="narrow prose reveal">'
            f'<p class="eyebrow">{e(d["eyebrow"])}</p><h2 style="margin-top:0">{e(d["h2"])}</h2><p>{e(d["intro"])}</p>'
            f'<ol>{steps}</ol><p>{d["small"].replace("{P}", P)}</p>{extra}</div></section>')

def meta(s, key, val):
    return re.sub(r'(<meta[^>]*' + key + r'[^>]*content=")[^"]*(")', lambda m: m.group(1) + e(val) + m.group(2), s)

for page, langs in C.items():
    for lang, d in langs.items():
        f = f'site/{PRE[lang].lstrip("/") + "/" if lang != "en" else ""}{page}.html'
        s = open(f).read()
        if 'data-seo="v1"' in s:
            print('skip', f); continue
        # 1. section after the first facts block
        i = s.index('class="wrap facts"'); j = s.index('</section>', i) + len('</section>')
        s = s[:j] + section(d, PRE[lang]) + s[j:]
        # 2. visible FAQ items
        k = s.index('<div class="faq">'); end = s.index('</div>', s.rindex('</details>', k, s.index('</section>', k)))
        s = s[:end] + ''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in d['faq']) + s[end:]
        # 3. FAQPage schema
        m = re.search(r'<script type="application/ld\+json">(\{[^<]*?"FAQPage".*?)</script>', s, re.S)
        j2 = json.loads(m.group(1))
        j2['mainEntity'] += [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in d['faq']]
        s = s[:m.start(1)] + json.dumps(j2, ensure_ascii=False) + s[m.end(1):]
        # 4. meta description
        for k2 in ['name="description"', 'property="og:description"', 'name="twitter:description"']:
            s = meta(s, k2, d['desc'])
        open(f, 'w').write(s); print('ok', f)
