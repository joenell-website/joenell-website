import re, json, html as H
T=json.load(open('tools/burnaby_i18n.json'))
slug='burnaby-wedding-photographer'
G=[("engagement-shaun-tina-01",800,640,1150,55,20),("couple-jenn-erin-garden",450,800,720,45,22),("engagement-shaun-tina-tulips",800,533,1280,44,24),("engagement-jenn-erin-6",800,640,1200,42,22),("engagement-shaun-tina-03",640,800,960,50,16),("proposal-jake-hannah-yes",800,640,1280,45,26),("engagement-jenn-erin-4",800,640,1280,54,38),("whistler-pinky-shika-kiss",800,533,1200,55,36)]
M={'hero-willow-kiss':('engagement-shaun-tina-07',49,15),'ceremony-walk':('engagement-shaun-tina-02',47,18),'ceremony-rings':('engagement-shaun-tina-04',50,22),'reception-first-dance':('engagement-shaun-tina-08',47,16),'sunset-beach-walk':('engagement-jenn-erin-7',38,40),'sunset-holding-hands':('engagement-shaun-tina-10',48,22),'sunset-seawall-couple':('engagement-jenn-erin-4',54,38)}
def sub1(pat,rep,s,flags=re.S):
    n=re.subn(pat,rep,s,count=1,flags=flags)
    assert n[1]==1, pat[:60]
    return n[0]
for L,t in T.items():
    s=open(f'site/{L}/whistler-wedding-photographer.html').read()
    e=lambda x:H.escape(x,quote=True)
    s=sub1(r'<title>.*?</title>',lambda m:f'<title>{e(t["title"])}</title>',s)
    s=re.sub(r'(<meta[^>]*(?:name="description"|property="og:description")[^>]*content=")[^"]*(")',lambda m:m.group(1)+e(t['desc'])+m.group(2),s)
    s=re.sub(r'(<meta[^>]*content=")[^"]*("[^>]*(?:name="description"|property="og:description")[^>]*>)',lambda m:m.group(1)+e(t['desc'])+m.group(2),s)
    s=re.sub(r'(<meta[^>]*property="og:title"[^>]*content=")[^"]*(")',lambda m:m.group(1)+e(t['title'])+m.group(2),s)
    s=re.sub(r'(<meta[^>]*content=")[^"]*("[^>]*property="og:title"[^>]*>)',lambda m:m.group(1)+e(t['title'])+m.group(2),s)
    s=s.replace('whistler-wedding-photographer"', slug+'"').replace('whistler-wedding-photographer<',slug+'<')
    s=s.replace('proposal-mountain-lookout.jpg"','engagement-shaun-tina-01.jpg"')
    s=re.sub(r'(<meta[^>]*property="og:image:alt"[^>]*content=")[^"]*(")',lambda m:m.group(1)+e(t['alts']['engagement-shaun-tina-01'])+m.group(2),s)
    s=re.sub(r'(<meta[^>]*content=")[^"]*("[^>]*property="og:image:alt"[^>]*>)',lambda m:m.group(1)+e(t['alts']['engagement-shaun-tina-01'])+m.group(2),s)
    # hero
    s=sub1(r'(<section[^>]*class="wed-hero".*?)<p class="eyebrow">[^<]*</p>\s*<h1 id="hero-h">.*?</h1>\s*<p class="lead">.*?</p>',lambda m:m.group(1)+f'<p class="eyebrow">{e(t["eyebrow"])}</p>\n<h1 id="hero-h">{t["h1"]}</h1>\n<p class="lead">{e(t["lead"])}</p>',s)
    s=sub1(r'<div class="reveal"><p class="eyebrow">[^<]*</p><h2>[^<]*</h2><p class="lead">.*?</p><p>.*?</p>',lambda m:f'<div class="reveal"><p class="eyebrow">{e(t["s_eyebrow"])}</p><h2>{e(t["s_h2"])}</h2><p class="lead">{e(t["s_lead"])}</p><p>{e(t["s_p"])}</p>',s)
    facts=''.join(f'<div class="fact reveal"><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a,b in t['facts'])
    s=sub1(r'<div class="wrap facts">.*?</div></div></section>',lambda m:f'<div class="wrap facts">{facts}</div></section>',s)
    figs=''.join(f'<figure><img src="/images/{n}-sm.jpg?v=20261028z" srcset="/images/{n}-sm.jpg?v=20261028z {w}w, /images/{n}.jpg?v=20261028z {W}w" sizes="(max-width:900px) 50vw, 33vw" width="{w}" height="{h}" alt="{e(t["alts"][n])}" data-fx="{fx}" data-fy="{fy}" style="object-position:{fx}% {fy}%" loading="lazy" decoding="async"></figure>' for n,w,h,W,fx,fy in G)
    s=sub1(r'<div class="gallery">.*?</div>\n</div></section>',lambda m:'<div class="gallery">'+figs+'</div>\n</div></section>',s)
    s=sub1(r'<h2 id="g-h">.*?</h2>',lambda m:f'<h2 id="g-h">{e(t["g_h2"])}</h2>',s)
    s=sub1(r'(<div class="price-box reveal">.*?<p style="margin-top:12px;color:var\(--ink-2\)">).*?(</p>)',lambda m:m.group(1)+e(t['price'])+m.group(2),s)
    s=sub1(r'(<div class="price-box reveal">.*?)<ul>.*?</ul>',lambda m:m.group(1)+'<ul>'+''.join(f'<li>{e(x)}</li>' for x in t['ul'])+'</ul>',s)
    fh=''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q,a in t['faq'])
    s=sub1(r'<div class="faq">.*?</div></div></section>',lambda m:'<div class="faq">'+fh+'</div></div></section>',s)
    # schema
    svc={"@context":"https://schema.org","@type":"Service","serviceType":t['service'],"provider":{"@id":"https://www.joenellphotography.ca/#business"},"areaServed":"Burnaby, BC","offers":{"@type":"Offer","priceCurrency":"CAD","price":"1000","description":t['price']}}
    fq={"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in t['faq']]}
    s=sub1(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "Service".*?</script>',lambda m:'<script type="application/ld+json">'+json.dumps(svc,ensure_ascii=False)+'</script>',s)
    s=sub1(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "FAQPage".*?</script>',lambda m:'<script type="application/ld+json">'+json.dumps(fq,ensure_ascii=False)+'</script>',s)
    s=sub1(r'("@type": "ListItem", "position": 2, "name": ")[^"]*(")',lambda m:m.group(1)+t['crumb']+m.group(2),s)
    # light table
    def fix(m):
        b=m.group(0)
        for old,(new,fx,fy) in M.items():
            if f'/images/{old}.jpg' in b:
                a=e(t['alts'][new])
                b=re.sub(r'aria-label="([^"]*?\d+)\s*([:：])\s*[^"]*"',lambda x:f'aria-label="{x.group(1)}{x.group(2)} {a}"',b)
                b=re.sub(r'/images/'+old+r'(-sm)?\.jpg\?v=\w+',lambda x:f'/images/{new}{x.group(1) or ""}.jpg?v=20261028z',b)
                b=re.sub(r'alt="[^"]*"',f'alt="{a}"',b)
                b=re.sub(r'data-fx="\d+" data-fy="\d+"',f'data-fx="{fx}" data-fy="{fy}"',b)
                b=re.sub(r'object-position:\d+% \d+%',f'object-position:{fx}% {fy}%',b)
        return b
    s=re.sub(r'<button[^>]*class="lt-slide.*?</button>',fix,s,flags=re.S)
    k=[0]
    def tab(m):
        i=k[0];k[0]+=1
        b=re.sub(r'data-caption="[^"]*"',f'data-caption="{e(t["caps"][i])}"',m.group(1))
        return b+e(t['tabs'][i])+'</button>'
    s=re.sub(r'(<button[^>]*role="tab"[^>]*>)[^<]*</button>',tab,s)
    s=re.sub(r'(<span class="lt-cap"[^>]*>)[^<]*(</span>)',lambda m:m.group(1)+e(t['caps'][0])+m.group(2),s)
    # split photo
    s=sub1(r'<div class="ph reveal"><img [^>]*vancouver-garden-arbour-kiss[^>]*>',lambda m:f'<div class="ph reveal"><img src="/images/engagement-shaun-tina-03-sm.jpg?v=20261028z" srcset="/images/engagement-shaun-tina-03-sm.jpg?v=20261028z 640w, /images/engagement-shaun-tina-03.jpg?v=20261028z 960w" sizes="(max-width:860px) 100vw, 50vw" width="640" height="800" alt="{e(t["alts"]["engagement-shaun-tina-03"])}" data-fx="50" data-fy="16" style="object-position:50% 10%" loading="lazy" decoding="async">',s)
    open(f'site/{L}/{slug}.html','w').write(s)
    bad=[x for x in ['hero-willow-kiss','ceremony-walk','reception-first-dance','chris-lorena','garden-arbour'] if x in s.split('<footer')[0]]
    print(L,'ok', 'leftover:',bad, 'whistler mentions in main:', len(re.findall('(?i)whistler|惠斯勒|ਵਿਸਲਰ',s[s.find('<main'):s.find('</main>')])))
