"""Build the tinselpatrol.com site files (repo root) from src/tinsel-patrol.html. Run: python3 build.py"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
SITE = D
URL = 'https://tinselpatrol.com/'
TITLE = 'Tinsel Patrol – Defend the Christmas Tree from Cats'
DESC = ('Cats are sneaking into the living room. Tap them away before they tear down your '
        'Christmas tree! A free festive game for your phone – no download needed.')
SOCIAL_TITLE = 'Tinsel Patrol: Defend the Tree!'
SOCIAL_DESC = 'Tap the cats before they tear down your Christmas tree. Free to play on your phone, no download.'
IMG_ALT = 'Tinsel Patrol game: cats climbing a Christmas tree in a cosy living room, with the words Defend the Tree!'

src = open(os.path.join(D, 'src', 'tinsel-patrol.html'), encoding='utf-8').read()
style_end = src.index('</style>') + len('</style>')
head_src = src[:style_end].replace('<title>Tinsel Patrol</title>\n', '')
body_src = src[style_end:].lstrip('\n')

jsonld = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    'name': 'Tinsel Patrol',
    'alternateName': 'Defend the Tree',
    'url': URL,
    'description': DESC,
    'image': URL + 'og-image.png',
    'genre': ['Casual', 'Arcade', 'Christmas'],
    'gamePlatform': ['Web browser', 'Mobile'],
    'applicationCategory': 'Game',
    'operatingSystem': 'Any',
    'playMode': 'SinglePlayer',
    'inLanguage': 'en',
    'isAccessibleForFree': True,
    'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'AUD'},
}

head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="canonical" href="{URL}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#2a1519">
<meta name="color-scheme" content="dark">

<!-- icons + install -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="application-name" content="Tinsel Patrol">
<meta name="apple-mobile-web-app-title" content="Tinsel Patrol">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="format-detection" content="telephone=no">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tinsel Patrol">
<meta property="og:locale" content="en_AU">
<meta property="og:url" content="{URL}">
<meta property="og:title" content="{SOCIAL_TITLE}">
<meta property="og:description" content="{SOCIAL_DESC}">
<meta property="og:image" content="{URL}og-image.png">
<meta property="og:image:secure_url" content="{URL}og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{IMG_ALT}">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{SOCIAL_TITLE}">
<meta name="twitter:description" content="{SOCIAL_DESC}">
<meta name="twitter:image" content="{URL}og-image.png">
<meta name="twitter:image:alt" content="{IMG_ALT}">

<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
'''

html = head + head_src + '\n</head>\n<body>\n' + body_src.rstrip() + '\n</body>\n</html>\n'
open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8').write(html)

manifest = {
    'name': 'Tinsel Patrol',
    'short_name': 'Tinsel Patrol',
    'description': SOCIAL_DESC,
    'start_url': '/',
    'scope': '/',
    'display': 'fullscreen',
    'orientation': 'portrait',
    'background_color': '#2a1519',
    'theme_color': '#2a1519',
    'categories': ['games', 'entertainment'],
    'icons': [
        {'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any maskable'},
        {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'},
        {'src': '/favicon.svg', 'sizes': 'any', 'type': 'image/svg+xml'},
    ],
}
json.dump(manifest, open(os.path.join(SITE, 'manifest.webmanifest'), 'w'), indent=2)

open(os.path.join(SITE, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: {URL}sitemap.xml\n')
open(os.path.join(SITE, 'sitemap.xml'), 'w').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    f'  <url><loc>{URL}</loc><lastmod>2026-09-26</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n'
    '</urlset>\n')
# Cloudflare Pages headers: correct manifest type, cache icons/images for a day
open(os.path.join(SITE, '_headers'), 'w').write(
    '/manifest.webmanifest\n  Content-Type: application/manifest+json\n\n'
    '/*.png\n  Cache-Control: public, max-age=86400\n\n'
    '/favicon.svg\n  Cache-Control: public, max-age=86400\n')


print('built index.html, manifest.webmanifest, robots.txt, sitemap.xml, _headers')
