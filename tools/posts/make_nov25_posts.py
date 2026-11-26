"""Writes tools/posts/sendall-gardens.json and tools/posts/abkhazi-garden.json (Nov 25, 2026).
Facts checked on: langleycity.ca (Sendall Gardens + bookings page), abkhaziteahouse.com (wedding pages),
sunrisesunset.io (Vancouver sunset times 2026). No couple names, own photos only."""
import json
from PIL import Image

V = '20261125a'


def fig(n, alt, fx=50, fy=30, cap=''):
    w, h = Image.open(f'site/images/{n}-sm.jpg').size
    W = Image.open(f'site/images/{n}.jpg').size[0]
    c = f'<figcaption>{cap}</figcaption>' if cap else ''
    return (f'<figure class="post-inline"><img src="/images/{n}-sm.jpg?v={V}" srcset="/images/{n}-sm.jpg?v={V} {w}w, /images/{n}.jpg?v={V} {W}w" '
            f'sizes="(max-width:760px) 100vw, 760px" width="{w}" height="{h}" alt="{alt}" data-fx="{fx}" data-fy="{fy}" '
            f'style="object-position:{fx}% {fy}%" loading="lazy" decoding="async">{c}</figure>')


sendall = {
    'slug': 'sendall-gardens-langley-engagement-photos',
    'title': 'Spring Engagement Photos at Sendall Gardens, Langley',
    'seo_title': 'Sendall Gardens Engagement Photos, Langley | Spring Guide',
    'desc': 'A spring engagement session at Sendall Gardens in Langley City: the best season, the prettiest corners, what to wear, the garden rules and how to plan it.',
    'date': '2026-11-25', 'date_h': 'November 25, 2026', 'read': '5 min read',
    'cats': ['Engagement Photography', 'Vancouver Photo Locations'],
    'tags': ['Langley Engagement Photographer', 'Sendall Gardens', 'Spring Engagement Photos', 'Fraser Valley Photographer', 'Joenell Photography'],
    'hero': ['engagement-tulip-garden-bench', 53, 33, 'Couple smiling on a garden bench surrounded by spring tulips'],
    'card_img': ['engagement-tulip-garden-bench', 53, 35],
    'prev': ['holiday-proposal-ideas-vancouver', 'Holiday Proposal Ideas in Vancouver (2026)'],
    'faq': [
        ['Do we need a permit for photos at Sendall Gardens?', 'Not at the moment. The City of Langley says no permit is currently required for photography, as long as the group is 15 people or fewer, you don\'t set up props or decorations, you don\'t block the paths and you don\'t take over any area, including the greenhouse. Photo sessions also can\'t run during a booked wedding ceremony.'],
        ['When is the best time of year for engagement photos at Sendall Gardens?', 'Spring is my favourite: from April into May the beds are full of colour and the light is soft. The tropical greenhouse is open from April 1 to October 1, and summer and early autumn are lovely too.'],
        ['Can we get married at Sendall Gardens?', 'Yes, for a small ceremony. The Legacy Gazebo can be booked from April 1 to October 1 for up to 30 standing guests, in four-hour blocks, for $200 plus tax. The City asks for at least 10 days\' notice and liability insurance, and there\'s no alcohol, amplified or live music, or confetti.'],
        ['How long is an engagement session and what does it cost?', 'My engagement sessions are $225 for up to 60 minutes, with at least 30 edited images and a sneak peek within 48 hours. Sendall Gardens is small, so an hour is plenty to use every corner.'],
    ],
}
sendall['prose'] = f'''<p>Sendall Gardens is one of Langley's quiet surprises: a small, free city garden of about 3.7 acres at 201A Street and 50 Avenue, with a creek, a gazebo, winding paths and a tropical greenhouse. In spring it's full of colour, and it's close enough to the rest of the Fraser Valley that it makes an easy, relaxed place for engagement photos.</p>
<p>This spring I photographed an engagement session here among the tulips. Here's what made it work, and how to plan your own.</p>
<h2 id="a-spring-session">A Spring Session Among the Tulips</h2>
<p>We kept it simple: cream and white outfits, a slow walk through the garden and plenty of time on the benches between the flower beds. The bright spring colour does the work, so the two of you can just enjoy each other.</p>
{fig('engagement-garden-bench-laugh', 'Couple laughing together on a garden bench among spring tulips', 50, 30)}
{fig('engagement-spring-embrace', 'Couple smiling together in a sunlit garden', 50, 18)}
<h2 id="best-season">The Best Season</h2>
<ul><li><strong>Spring (April and May):</strong> my favourite time. The beds are at their brightest and the light is soft.</li><li><strong>Summer:</strong> long evenings and full green trees. Plan for the last hour or two before sunset.</li><li><strong>The greenhouse:</strong> the tropical greenhouse is open to the public from April 1 to October 1.</li></ul>
<h2 id="best-corners">The Prettiest Corners</h2>
<ul><li><strong>The benches between the flower beds</strong>: relaxed, seated photos with colour all around you.</li><li><strong>The paths along Muckle Creek</strong>: shade and soft light for walking photos.</li><li><strong>Under the big trees</strong>: quieter, more intimate portraits.</li><li><strong>The Legacy Gazebo</strong>: lovely when it's free, but it's booked for small weddings from April to October, so we work around those times.</li></ul>
{fig('engagement-cedar-tree-kiss', 'Couple kissing beside a tall tree', 50, 25)}
<h2 id="what-to-wear">What to Wear</h2>
<p>Soft, light colours look beautiful against spring flowers: cream, white, blush and pale green. Avoid big logos and very busy prints. Bring comfortable shoes for the paths and a light layer, because spring evenings in the Fraser Valley cool down quickly. For more ideas, see my <a href="/blog/what-to-wear-engagement-photos-vancouver">engagement outfit guide</a>.</p>
<h2 id="garden-rules">Garden Rules and Getting There</h2>
<ul><li><strong>Permits:</strong> none are currently required for photos, according to the City of Langley.</li><li><strong>Group size:</strong> 15 people or fewer.</li><li><strong>No props or decorations</strong>, and no taking over any area, including the greenhouse.</li><li><strong>Keep the paths clear</strong> for other visitors.</li><li><strong>Weddings come first:</strong> photo sessions can't run during a booked ceremony at the gazebo.</li><li><strong>Where:</strong> 201A Street and 50 Avenue, Langley City. I'll send you the exact meeting point with your session plan.</li></ul>
<p>Rules can change, so I check the City's page before every session.</p>
<h2 id="plan-yours">Plan Your Session</h2>
<p>Engagement sessions are $225 for up to 60 minutes. I also photograph weddings and elopements across Langley and the Fraser Valley; see my <a href="/langley-wedding-photographer">Langley wedding photography page</a> and <a href="/engagements">engagements page</a>.</p>
<h2 id="faq">Frequently Asked Questions</h2>
{{FAQ}}
<p style="font-size:14px">Garden facts from the <a href="https://www.langleycity.ca/parks-recreation/recreation-facilities/facility-rentals/sendall-gardens-bookings" rel="noopener">City of Langley</a>, checked November 2026.</p>'''

abkhazi = {
    'slug': 'abkhazi-garden-wedding-victoria',
    'title': 'A Garden Wedding at Abkhazi Garden, Victoria: Venue Tips',
    'seo_title': 'Abkhazi Garden Wedding, Victoria BC | Photographer Tips',
    'desc': 'Planning a small garden wedding at Abkhazi Garden in Victoria: ceremony spots, guest numbers, morning bookings, the best light and photography tips.',
    'date': '2026-11-25', 'date_h': 'November 25, 2026', 'read': '5 min read',
    'cats': ['Vancouver Weddings', 'Wedding Planning Tips'],
    'tags': ['Victoria Wedding Photographer', 'Abkhazi Garden Wedding', 'Garden Wedding BC', 'Vancouver Island Weddings', 'Joenell Photography'],
    'hero': ['wedding-autumn-garden-kiss', 56, 22, 'Couple kissing on the lawn of a garden on their wedding day'],
    'card_img': ['wedding-autumn-garden-kiss', 56, 24],
    'prev': ['sendall-gardens-langley-engagement-photos', 'Spring Engagement Photos at Sendall Gardens, Langley'],
    'faq': [
        ['How many guests can Abkhazi Garden hold for a wedding?', 'The garden welcomes ceremonies of up to 50 guests, and the Teahouse seats up to 36, so it suits small, intimate weddings.'],
        ['When can you get married at Abkhazi Garden?', 'Weddings are booked outside regular opening hours (11 am to 5 pm). A morning booking gives you exclusive use of the garden and Teahouse from 9 to 11 am. Contact the Teahouse for current dates and options.'],
        ['How much does a wedding at Abkhazi Garden cost?', 'The Teahouse lists the garden rental for a morning booking at $2,500. Check with them for current prices and what\'s included.'],
        ['Do you travel to Victoria for weddings?', 'Yes. I\'m based in Vancouver and photograph weddings on Vancouver Island. Travel outside Metro Vancouver is open for discussion, so tell me your date and plans and I\'ll put together a quote.'],
    ],
}
abkhazi['prose'] = f'''<p>Abkhazi Garden in Victoria's Fairfield neighbourhood is one of the most romantic small venues in BC. Prince and Princess Abkhazi began creating it in 1946, the year they married, and it's still known as "the Garden that Love Built". At about one acre, with a Summer House, a terrace and a Teahouse, it's made for small weddings.</p>
<p>The photos in this post are from an autumn garden wedding I photographed. Here's how to plan a day like it at Abkhazi Garden, and how to get the most out of the light and the garden.</p>
<h2 id="the-venue">The Venue at a Glance</h2>
<ul><li><strong>Where:</strong> 1964 Fairfield Road, Victoria.</li><li><strong>Ceremony:</strong> the Summer House is the suggested ceremony spot, with up to 50 guests in the garden.</li><li><strong>Toast:</strong> the terrace is a lovely place for a champagne toast after the ceremony.</li><li><strong>Teahouse:</strong> seats up to 36 guests, with a fireplace lit in winter.</li><li><strong>Exclusive use:</strong> wedding bookings are outside regular hours (11 am to 5 pm). A morning booking gives you the garden and Teahouse from 9 to 11 am, with afternoon tea for guests until 12:30 pm.</li><li><strong>Garden rental:</strong> listed at $2,500 for a morning booking.</li></ul>
{fig('wedding-garden-vows', 'Couple holding hands as they exchange vows at their garden ceremony', 52, 18, 'The vows')}
<h2 id="the-light">Ceremony Light</h2>
<p>A morning ceremony is a gift for photos. The light is softer than at midday, and you have the garden to yourselves. In autumn, the low sun brings out the colour in the leaves. In spring and summer, the morning light keeps skin tones gentle and the greens fresh. I plan the ceremony spot and the timing together with you, so faces aren't caught in harsh sun.</p>
{fig('vancouver-autumn-wedding-portrait', 'Bride and groom smiling at the camera in an autumn garden', 45, 15)}
<h2 id="portraits">Portraits in the Garden</h2>
<p>Small gardens are perfect for portraits: everything is a short walk away, so we spend the time on you, not on moving between locations. I like to take ten quiet minutes for just the two of you right after the ceremony, then a few more during the toast.</p>
{fig('wedding-garden-path-walk', 'Bride and groom walking hand in hand along a flower-lined garden path', 52, 28)}
{fig('couple-dip-kiss', 'Groom lifting the bride into a kiss on a garden path', 30, 10)}
<h2 id="tips">Planning Tips</h2>
<ul><li><strong>Ask about garden rules</strong> (confetti, music, décor and timing) when you book; the Teahouse handles weddings directly.</li><li><strong>Keep the guest list small:</strong> up to 50 for the ceremony and 36 in the Teahouse.</li><li><strong>Plan a rain option:</strong> Victoria weather changes quickly, and the Teahouse is a beautiful backup.</li><li><strong>Getting ready nearby:</strong> a hotel or home close to Fairfield keeps the morning calm.</li><li><strong>Coverage:</strong> for a morning ceremony and toast, my two-hour <a href="/store/p/the-vow-collection">Vow collection</a> is usually enough.</li></ul>
{fig('getting-ready-veil', 'Bride putting on lipstick in the mirror, wearing a floral veil', 40, 18, 'Getting ready')}
<h2 id="book">Planning a Victoria Wedding?</h2>
<p>Weddings start at $1,000. See my <a href="/victoria-wedding-photographer">Victoria wedding photography page</a> and <a href="/weddings">weddings page</a>, or tell me your date.</p>
<h2 id="faq">Frequently Asked Questions</h2>
{{FAQ}}
<p style="font-size:14px">Venue details from <a href="https://abkhaziteahouse.com/wedding-booking-info" rel="noopener">the Teahouse at Abkhazi Garden</a>, checked November 2026. Prices and options can change; confirm with the venue.</p>'''

for name, P in [('sendall-gardens', sendall), ('abkhazi-garden', abkhazi)]:
    json.dump(P, open(f'tools/posts/{name}.json', 'w'), ensure_ascii=False, indent=1)
print('ok')
