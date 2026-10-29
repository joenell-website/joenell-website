"""Rebuild the footer 'areas' column on every page as collapsible regions, and make sure every
existing area page (all languages) is in the sitemap. Idempotent — run after adding any area page.
Labels come from tools/<area>_i18n.json 'footer' (or the existing link title for older pages)."""
import re,glob,json,os
REG=[('metro',['burnaby','coquitlam','langley','north-vancouver','richmond','surrey','west-vancouver','white-rock']),
     ('fraser',['abbotsford','chilliwack']),('sea',['squamish','whistler']),
     ('island',['victoria','nanaimo','tofino']),('okanagan',['kelowna'])]
RN={'':{'metro':'Metro Vancouver','fraser':'Fraser Valley','sea':'Sea to Sky','island':'Vancouver Island','okanagan':'Okanagan'},
    'fr':{'metro':'Grand Vancouver','fraser':'Vallée du Fraser','sea':'Sea to Sky','island':'Île de Vancouver','okanagan':'Okanagan'},
    'es':{'metro':'Metro Vancouver','fraser':'Valle del Fraser','sea':'Sea to Sky','island':'Isla de Vancouver','okanagan':'Okanagan'},
    'zh':{'metro':'大温哥华','fraser':'菲沙河谷','sea':'海天公路','island':'温哥华岛','okanagan':'奥肯那根'},
    'pa':{'metro':'ਮੈਟਰੋ ਵੈਨਕੂਵਰ','fraser':'ਫਰੇਜ਼ਰ ਵੈਲੀ','sea':'ਸੀ ਟੂ ਸਕਾਈ','island':'ਵੈਨਕੂਵਰ ਆਈਲੈਂਡ','okanagan':'ਓਕਾਨਾਗਨ'}}
HEAD={'':'Wedding photography in','fr':'Photographe de mariage à','es':'Fotógrafo de bodas en','zh':'婚礼摄影服务地区','pa':'ਵਿਆਹ ਫੋਟੋਗ੍ਰਾਫੀ ਦੇ ਇਲਾਕੇ'}
LANGS=['','fr','es','zh','pa']
short=lambda t:re.sub(r' weddings$|^Mariages à |^Bodas en |婚礼$| ਵਿਆਹ$','',t)
pre=lambda L:('/'+L) if L else ''
exists=lambda a:os.path.exists(f'site/{a}-wedding-photographer.html')
# labels
lab={}
idx={L:open(f'site/{L+"/" if L else ""}index.html').read() for L in LANGS}
for _,areas in REG:
    for a in areas:
        if not exists(a): continue
        jf=f'tools/{a}_i18n.json'
        for L in LANGS:
            J=json.load(open(jf)) if os.path.exists(jf) else {}
            if (L or 'en') in J: lab[(L,a)]=J[L or 'en']['footer']
            else:
                m=re.search(r'href="'+pre(L)+'/'+a+r'-wedding-photographer"[^>]*title="([^"]+)"',idx[L]) or re.search(r'href="'+pre(L)+'/'+a+r'-wedding-photographer">([^<]+)<',idx[L])
                lab[(L,a)]=m.group(1)
def block(L,cur):
    out=f'<div class="areas"><h2>{HEAD[L]}</h2>'
    for r,areas in REG:
        av=[a for a in areas if exists(a)]
        if not av: continue
        op=' open' if cur in av else ''
        out+=f'<details class="area-group"{op}><summary>{RN[L][r]} <span>({len(av)})</span></summary><ul>'+''.join(f'<li><a href="{pre(L)}/{a}-wedding-photographer" title="{lab[(L,a)]}">{short(lab[(L,a)])}</a></li>' for a in av)+'</ul></details>'
    return out+'</div>'
n=0
for f in glob.glob('site/**/*.html',recursive=True):
    s=open(f).read()
    if '<div class="areas">' not in s: continue
    m=re.match(r'site/(fr|es|zh|pa)/',f); L=m.group(1) if m else ''
    c=re.search(r'/([a-z-]+)-wedding-photographer\.html$',f); cur=c.group(1) if c else None
    s2=re.sub(r'<div class="areas">.*?</ul></div>(?:</details></div>)?(?=\n?<div><h2>)',lambda _:block(L,cur),s,count=1,flags=re.S)
    if s2==s: s2=re.sub(r'<div class="areas">.*?</div>(?=\n?<div><h2>)',lambda _:block(L,cur),s,count=1,flags=re.S)
    assert s2!=s or block(L,cur) in s, f
    if s2!=s: open(f,'w').write(s2); n+=1
print('footer pages updated',n)
sm=open('site/sitemap.xml').read(); add=0
for _,areas in REG:
    for a in areas:
        if not exists(a): continue
        for L in LANGS:
            u=f'https://www.joenellphotography.ca/{L+"/" if L else ""}{a}-wedding-photographer'
            if f'<loc>{u}</loc>' not in sm:
                sm=sm.replace('</urlset>',f'  <url><loc>{u}</loc><lastmod>2026-10-29</lastmod></url>\n</urlset>'); add+=1
open('site/sitemap.xml','w').write(sm); print('sitemap added',add,'total',sm.count('<url>'))
