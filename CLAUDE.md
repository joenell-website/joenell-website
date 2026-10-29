# Joenell Photography website — notes for Claude

Read this before changing anything. The fuller project history lives in the owner's Desktop folder
"Joenell Website - Claude handoff" › HANDOFF - READ FIRST.md (start with the CURRENT STATE box).

## Current setup (Oct 28, 2026)
- Live: https://www.joenellphotography.ca — Cloudflare Pages project `joenell-website`, auto-deploys `main`. Output dir `site/`, no build step.
- Preview: every branch gets https://<branch>.joenell-website.pages.dev
- Workflow: branch → push → check preview (all sitemap URLs 200, no horizontal overflow 390–1920px, form + WhatsApp work) → merge to `main` → verify live.
- Cache-busting: bump the `?v=` version on styles.css / site.js / images across all HTML when they change (current: images 20261028z, styles.css 20261029c; site.js 20261029b; whistler-pinky-shika-laugh images 20261029a). /assets/* is cached 1 year.
- Area pages: tools/make_area.py <area> tools/<area>_i18n.json "<Area>, BC" (base = Burnaby page), then tools/area_photos.py (vary the Book-your-date + gallery C&L photo), then tools/add_area_links.py <area> <previous-area>; footer area list lives in the "areas" column (ORDER in the footer script). Outside Metro Vancouver: travel "open for discussion".
- `site/_redirects`: NEVER add a `/blog//*` rule (Cloudflare normalises `//`, it caused an infinite redirect loop on Oct 27).
- Languages: EN + /fr /es /zh /pa copies of the 9 main pages — edit every language when changing shared copy.
- Public contact email everywhere: wedding@joenellphotography.ca (Cloudflare Email Routing → JoenellPhotography@gmail.com). Never publish the Gmail address.
- Enquiry form posts to the Google Form "Website enquiries" (entry IDs in site/assets/site.js). GA4: G-G61PTMD5HT, events generate_lead, whatsapp_click.
- "Message me" menu on every page (WhatsApp, Instagram, Text, Messenger, Email); GA4 contact_click{channel}.
- Booking terms: 20% non-refundable deposit; balance 2 weeks before weddings/elopements, 1 week before engagements/proposals.
- Owner preferences: Claude takes every click it's allowed to; when the owner must act (domain/DNS changes, permanent deletes, password sign-ins), guide step by step. Photos: only the owner's own Lightroom picks, never stock.
- Uploading images to Google Business Profile without a file picker: in the profile editor's same-origin iframe, fetch the image from https://joenell-website.pages.dev/pins/… (allowed by Google's CSP; the custom domain is not), wrap it in a File, set input.files via DataTransfer and dispatch `change`.
- Photo framing: `data-fx/data-fy` = subject focus point (site.js keeps it in frame). If a subject can't be centred because the photo itself is off-centre, recrop the image files and bump that image's `?v=`.
