"""Nov 25, 2026: expand the Bowen Lookout and Stanley Park posts (no names). Edits the live HTML and the
JSON source together. Facts: vancouvertrails.com (Bowen Lookout route), sunrisesunset.io (2026 sunset times)."""
import json, re, html as H
from PIL import Image

V = '20261125a'


def fig(n, alt, fx=50, fy=30, cap=''):
    w, h = Image.open(f'site/images/{n}-sm.jpg').size
    W = Image.open(f'site/images/{n}.jpg').size[0]
    c = f'<figcaption>{cap}</figcaption>' if cap else ''
    return (f'<figure class="post-inline"><img src="/images/{n}-sm.jpg?v={V}" srcset="/images/{n}-sm.jpg?v={V} {w}w, /images/{n}.jpg?v={V} {W}w" '
            f'sizes="(max-width:760px) 100vw, 760px" width="{w}" height="{h}" alt="{alt}" data-fx="{fx}" data-fy="{fy}" '
            f'style="object-position:{fx}% {fy}%" loading="lazy" decoding="async">{c}</figure>')


def ids(t): return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:60]


SUNSET = ('<table class="sun"><thead><tr><th>Month (mid)</th><th>Sunset</th><th>Start walking / start photos</th></tr></thead><tbody>'
          '<tr><td>March</td><td>7:18 pm</td><td>about 5:45 pm</td></tr><tr><td>May</td><td>8:49 pm</td><td>about 7:15 pm</td></tr>'
          '<tr><td>June 21</td><td>9:21 pm</td><td>about 7:50 pm</td></tr><tr><td>August</td><td>8:28 pm</td><td>about 6:55 pm</td></tr>'
          '<tr><td>September</td><td>7:25 pm</td><td>about 5:55 pm</td></tr><tr><td>October</td><td>6:21 pm</td><td>about 4:50 pm</td></tr>'
          '<tr><td>December 21</td><td>4:16 pm</td><td>about 2:45 pm</td></tr></tbody></table>'
          '<p style="font-size:14px">Vancouver sunset times for 2026 from <a href="https://sunrisesunset.io/ca/british-columbia/vancouver/2026/" rel="noopener">sunrisesunset.io</a> (December from <a href="https://curiocity.com/5-pm-sunsets-vancouver/" rel="noopener">Curiocity</a>).</p>')

BOWEN_ADD = f'''<h2 id="the-walk">The Walk, Step by Step</h2>
<ol><li>Park in the downhill ski area lot, as close to the buildings as you can.</li><li>The trail starts at the far end of the Crazy Raven Bar and Grill, to the right of the trail map board.</li><li>Follow the gravel trail into the forest and go right at the junction with the Howe Sound Crest Trail.</li><li>Climb up to a ski run and on past a large water tower, then follow the wide, level path.</li><li>After a wooden bridge the trail climbs through switchbacks to the Bowen Lookout sign. Go left and down to the viewpoint.</li></ol>
<p>It's an easy walk, but the switchbacks are steady enough that most people arrive a little out of breath. Build in five minutes at the top to catch your breath before the big moment.</p>
<h2 id="timing">Timing: When to Start Walking</h2>
<p>The lookout faces west over Howe Sound, so the last hour before sunset is the magic window. Plan to leave the parking lot about 90 minutes before sunset: around 45 minutes for the walk, time to settle in, then the question in warm light, and portraits as the sun goes down.</p>
{SUNSET}
<h2 id="where-i-wait">Where I Wait</h2>
<p>I walk up well ahead of you and wait near the viewpoint, dressed like any other hiker, with a long lens so I don't need to be close. The trees around the rocks make it easy to stay out of sight. Before the day we agree where you'll stand, so the view is behind you both and I can see your faces. You won't notice me until you're ready for me.</p>
<h2 id="tips">Tips From Proposals on the Mountain</h2>
<ul><li><strong>Keep a backup date.</strong> Cloud can sit on Cypress while the city is clear. If the lookout is fogged in, we move to the backup.</li><li><strong>Bring layers.</strong> It's cooler and windier at the top than in Vancouver.</li><li><strong>Headlamps for the walk down</strong> after sunset, especially from September onward.</li><li><strong>Phones on silent</strong>, and let me take the photos so you can be in the moment.</li><li><strong>Snow changes everything.</strong> In winter, check the winter trail details above before you plan.</li></ul>
'''
BOWEN_FAQ = [
    ['Where do you hide during a proposal at Bowen Lookout?', 'I walk up ahead and wait near the viewpoint like any other hiker, using a long lens so I don\'t have to be close. We agree in advance where you\'ll stand, so the view is behind you and I can see both your faces.'],
    ['What time should we start the walk to Bowen Lookout?', 'Leave the parking lot about 90 minutes before sunset. That gives you around 45 minutes to walk up, a few minutes to settle in, then the proposal in warm light and portraits as the sun sets.'],
]

STANLEY_ADD = f'''<h2 id="golden-hour-silhouettes">Golden-Hour Silhouettes at English Bay and the Seawall</h2>
<p>One of my favourite ways to end a Stanley Park session is on the water. After cherry blossoms and forest paths in the park, we walk out to the seawall and the beach at English Bay for the last light. When the sun drops toward the horizon, the sky turns gold and the two of you become a silhouette against the water.</p>
{fig('engagement-english-bay-sunset', 'Silhouette of an engaged couple facing each other at sunset by the ocean', 48, 27)}
<h3 id="sunset-timing">Sunset Timing</h3>
<p>Plan to be on the seawall about 30 minutes before sunset. The best silhouettes come in the ten or fifteen minutes either side of it.</p>
{SUNSET.replace('Start walking / start photos', 'Start the session').replace('about ', 'about ')}
<h3 id="silhouette-tips">Spot and Pose Tips</h3>
<ul><li><strong>Face west.</strong> English Bay looks out to the open water where the sun sets, so the sky behind you does the work.</li><li><strong>Find some height.</strong> The seawall rocks and the edge of the beach lift you against the sky, with nothing behind you but water and light.</li><li><strong>Keep a little space between you.</strong> A gap between your faces, or a forehead-to-forehead pose, reads beautifully in silhouette.</li><li><strong>Simple outlines.</strong> A flowing dress or skirt and an uncluttered silhouette look best.</li><li><strong>Turn around too.</strong> With the sun behind me instead, the low light turns warm and golden on your faces.</li></ul>
{fig('engagement-beach-golden-hour', 'He brushes her hair back as they laugh on a beach at golden hour', 44, 38)}
'''
STANLEY_FAQ = [
    ['What time is sunset at English Bay?', 'It ranges from about 4:16 pm around December 21 to about 9:20 pm around June 21. For silhouettes, be on the seawall about 30 minutes before sunset.'],
    ['Where are the best spots for silhouette photos near Stanley Park?', 'The seawall and the beach at English Bay, facing west over the water. Anywhere with open water and sky behind you works; the seawall rocks give a little height against the horizon.'],
]


def apply(html_path, json_path, before_id, add_html, faq_add, faq_before_id):
    s = open(html_path).read()
    assert add_html.split('"')[1] not in s, 'already expanded'
    s = s.replace(f'<h2 id="{before_id}">', add_html + f'<h2 id="{before_id}">', 1)
    faq_html = ''.join(f'<h3 id="{ids(q)}">{H.escape(q)}</h3>\n<p>{H.escape(a)}</p>\n' for q, a in faq_add)
    s = s.replace(f'<h2 id="{faq_before_id}">', faq_html + f'<h2 id="{faq_before_id}">', 1)
    # TOC
    for i, t in re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', add_html):
        s = s.replace(f'<li><a href="#{before_id}">', f'<li><a href="#{i}">{t}</a></li><li><a href="#{before_id}">', 1)

    def ld(m):
        d = json.loads(m.group(2))
        if d.get('@type') == 'FAQPage':
            d['mainEntity'] += [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_add]
        if d.get('@type') == 'BlogPosting':
            d['dateModified'] = '2026-11-25'
        return m.group(1) + json.dumps(d, ensure_ascii=False) + m.group(3)
    s = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', ld, s, flags=re.S)
    open(html_path, 'w').write(s)
    P = json.load(open(json_path))
    P['prose'] = P['prose'].replace(f'<h2 id="{before_id}">', add_html + f'<h2 id="{before_id}">', 1)
    P['faq'] += faq_add
    json.dump(P, open(json_path, 'w'), ensure_ascii=False, indent=1)
    print('expanded', html_path)


apply('site/blog/bowen-lookout-cypress-mountain-proposal.html', 'tools/posts/bowen-lookout.json', 'planning-the-moment', BOWEN_ADD, BOWEN_FAQ, 'planning-a-proposal')
apply('site/blog/stanley-park-wedding-engagement-photos.html', 'tools/posts/stanley-park.json', 'a-sample-session-route', STANLEY_ADD, STANLEY_FAQ, 'planning-photos-in-stanley-park')
