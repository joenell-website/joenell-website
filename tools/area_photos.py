"""Set an area page's 'Book your date' photo and its Chris & Lorena gallery photo (all languages).
Usage: python3 tools/area_photos.py <area> <split-image> <fx> <fy> <gallery-image> <gfx> <gfy>
Gallery image replaces the engagement-shaun-tina-03 figure inherited from the Burnaby base."""
import re,glob,sys
from PIL import Image
a,sp,sfx,sfy,g,gfx,gfy=sys.argv[1:8]
PRE=r'(?:Agrandir\s*:\s*|Ver en grande:\s*|查看大图：\s*|ਵੱਡਾ ਕਰਕੇ ਵੇਖੋ:\s*)'
AREA=r'(burnaby|surrey|richmond|north-vancouver|coquitlam|white-rock|abbotsford|chilliwack|victoria|nanaimo)-wedding'
def alt_for(L,n):
    files=[f for f in glob.glob(f'site/{L}**/*.html',recursive=True) if not re.search(AREA,f)]
    if L=='': files=[f for f in files if not re.match(r'site/(fr|es|zh|pa)/',f)]
    for f in files:
        for t in re.findall(r'<img[^>]*>|<button[^>]*>',open(f).read()):
            if f'/images/{n}' in t:
                m=re.search(r'\balt="([^"]+)"',t) or re.search(r'aria-label="([^"]+)"',t)
                if m: return re.sub(r'^'+PRE,'',re.sub(r'^[^:：]*\d+\s*[:：]\s*','',m.group(1)))
    raise Exception(L+n)
def dims(n): return Image.open(f'site/images/{n}-sm.jpg').size+(Image.open(f'site/images/{n}.jpg').size[0],)
for L in ['','fr/','es/','zh/','pa/']:
    f=f'site/{L}{a}-wedding-photographer.html'; s=open(f).read()
    w,h,W=dims(sp)
    new=f'<div class="ph reveal"><img src="/images/{sp}-sm.jpg?v=20261028z" srcset="/images/{sp}-sm.jpg?v=20261028z {w}w, /images/{sp}.jpg?v=20261028z {W}w" sizes="(max-width:860px) 100vw, 50vw" width="{w}" height="{h}" alt="{alt_for(L,sp)}" data-fx="{sfx}" data-fy="{sfy}" style="object-position:{sfx}% {sfy}%" loading="lazy" decoding="async">'
    s,k=re.subn(r'<div class="ph reveal"><img [^>]*>',lambda m:new,s,count=1); assert k==1
    w,h,W=dims(g)
    fig=f'<figure><img src="/images/{g}-sm.jpg?v=20261028z" srcset="/images/{g}-sm.jpg?v=20261028z {w}w, /images/{g}.jpg?v=20261028z {W}w" sizes="(max-width:900px) 50vw, 33vw" width="{w}" height="{h}" alt="{alt_for(L,g)}" data-fx="{gfx}" data-fy="{gfy}" style="object-position:{gfx}% {gfy}%" loading="lazy" decoding="async"></figure>'
    s,k=re.subn(r'<figure><img src="/images/(?:engagement-shaun-tina-03|wedding-chris-lorena-vows)-sm\.jpg[^>]*></figure>',lambda m:fig,s); assert k==1
    open(f,'w').write(s)
print('photos ok')
