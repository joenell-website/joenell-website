// Everything under /app needs the owner's session, except the sign-in page and its assets.
import { cleanEnv, readSession } from '../_lib/session.js';

const PUBLIC = new Set(['/app/login', '/app/login.html', '/app/manifest.webmanifest', '/app/icon.svg']);

export async function onRequest(ctx) {
  const env = cleanEnv(ctx.env), url = new URL(ctx.request.url);
  let res;
  if (PUBLIC.has(url.pathname) || await readSession(ctx.request, env)) res = await ctx.next();
  else return Response.redirect(`${url.origin}/app/login`, 302);
  res = new Response(res.body, res);
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
