# joenellphotography.ca

Static website for Joenell Photography, hosted on Cloudflare Pages.

- `site/` is the published website (Cloudflare Pages output directory: `site`, no build command).
- `site/_redirects` and `site/_headers` are Cloudflare Pages config.
- Asset cache-busting: bump the `?v=` version string on styles.css, site.js and image links when they change.
- Enquiry form posts to the "Website enquiries" Google Form; analytics is GA4 `G-G61PTMD5HT`.

Changes go to a branch first (Cloudflare builds a preview URL), are checked, then merged to `main` to go live.
