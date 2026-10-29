"""Footer link + sitemap for a new area page, inserted after the previous area.
Usage: python3 tools/add_area_links.py <new-area> <after-area>"""
import re,glob,json,sys
new,after=sys.argv[1],sys.argv[2]
T=json.load(open(f'tools/{new}_i18n.json'))
n=0
for f in glob.glob('site/**/*.html',recursive=True):
    s=open(f).read()
    if re.search(r'<a href="(/\w\w)?/'+new+r'-wedding-photographer">',s): continue
    s2,k=re.subn(r'<a href="(/(?:fr|es|zh|pa))?/'+after+r'-wedding-photographer">[^<]*</a>',lambda m:m.group(0)+f'</li><li><a href="{m.group(1) or ""}/{new}-wedding-photographer">{T[(m.group(1) or "/en")[1:]]["footer"]}</a>',s)
    if k: open(f,'w').write(s2); n+=k
print('links',n)
s=open('site/sitemap.xml').read()
for L in ['','fr/','es/','zh/','pa/']:
    m=re.search(r'  <url><loc>https://www\.joenellphotography\.ca/'+L+after+r'-wedding-photographer</loc><lastmod>[^<]*</lastmod></url>\n',s)
    old=m.group(0); s=s.replace(old,old+old.replace(after,new))
open('site/sitemap.xml','w').write(s); print('sitemap',s.count('<url>'))
