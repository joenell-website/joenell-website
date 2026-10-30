"""Make a signed card-payment link for a booking.
LINK_SECRET must match the one stored in Cloudflare (never commit it). Usage:
  LINK_SECRET=... python3 tools/make_pay_link.py --ref JP-2027-0612 --kind deposit --amount 290 \
     --desc "Deposit (20%) - The Story - June 12, 2027" --email couple@example.com [--days 14] [--base https://www.joenellphotography.ca]"""
import argparse, base64, hashlib, hmac, json, os, time
a = argparse.ArgumentParser()
a.add_argument('--ref', required=True); a.add_argument('--kind', choices=['deposit', 'balance'], required=True)
a.add_argument('--amount', type=float, required=True, help='CAD dollars'); a.add_argument('--desc', required=True)
a.add_argument('--email', default=''); a.add_argument('--days', type=int, default=14)
a.add_argument('--base', default='https://www.joenellphotography.ca')
o = a.parse_args(); secret = os.environ['LINK_SECRET']
d = base64.urlsafe_b64encode(json.dumps({'ref': o.ref, 'kind': o.kind, 'amt': round(o.amount * 100), 'desc': o.desc,
    'email': o.email, 'exp': int(time.time()) + o.days * 86400}, separators=(',', ':')).encode()).decode().rstrip('=')
s = hmac.new(secret.encode(), d.encode(), hashlib.sha256).hexdigest()
print(f'{o.base}/api/pay?d={d}&s={s}')
