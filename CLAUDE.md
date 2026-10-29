# Joenell Photography website — notes for Claude

Read this before changing anything. The fuller project history lives in the owner's Desktop folder
"Joenell Website - Claude handoff" › HANDOFF - READ FIRST.md (start with the CURRENT STATE box).

## Current setup (Oct 28, 2026)
- Live: https://www.joenellphotography.ca — Cloudflare Pages project `joenell-website`, auto-deploys `main`. Output dir `site/`, no build step.
- Preview: every branch gets https://<branch>.joenell-website.pages.dev
- Workflow: branch → push → check preview (all sitemap URLs 200, no horizontal overflow 390–1920px, form + WhatsApp work) → merge to `main` → verify live.
- Cache-busting: bump the `?v=` version on styles.css / site.js / images across all HTML when they change (current: 20261028x). /assets/* is cached 1 year.
- `site/_redirects`: NEVER add a `/blog//*` rule (Cloudflare normalises `//`, it caused an infinite redirect loop on Oct 27).
- Languages: EN + /fr /es /zh /pa copies of the 9 main pages — edit every language when changing shared copy.
- Enquiry form posts to the Google Form "Website enquiries" (entry IDs in site/assets/site.js). GA4: G-G61PTMD5HT, events generate_lead, whatsapp_click.
- WhatsApp button: wa.me/12362341041 on every page.
- Owner preferences: Claude takes every click it's allowed to; when the owner must act (domain/DNS changes, permanent deletes, password sign-ins), guide step by step. Photos: only the owner's own Lightroom picks, never stock.
