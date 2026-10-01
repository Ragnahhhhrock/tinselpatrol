// Builds www/ (the folder bundled inside the iOS app) from public/ (the website).
// Differences from the website: fonts are bundled so the game works offline, and
// web-only files (sitemap, robots, _headers, social cards) are left out.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
rmSync(www, { recursive: true, force: true });
mkdirSync(join(www, 'fonts'), { recursive: true });

const fontFiles = [
  ['lilita-one', 'lilita-one-latin-400-normal.woff2'],
  ['nunito', 'nunito-latin-600-normal.woff2'],
  ['nunito', 'nunito-latin-800-normal.woff2'],
];
for (const [pkg, f] of fontFiles) {
  const src = join(root, 'node_modules', '@fontsource', pkg, 'files', f);
  if (!existsSync(src)) throw new Error('Missing font ' + src + ' (run npm ci)');
  cpSync(src, join(www, 'fonts', f));
}

let html = readFileSync(join(root, 'public', 'index.html'), 'utf8');

// Swap the Google Fonts links for local @font-face rules (same families and weights).
const before = html.length;
html = html
  .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, '')
  .replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g, '')
  .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>\s*/g, '');
if (html.includes('fonts.googleapis.com')) throw new Error('Google Fonts link not removed; update scripts/prepare-www.mjs');
const faces = `<style>
@font-face{font-family:'Lilita One';font-weight:400;font-display:swap;src:url(fonts/lilita-one-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:'Nunito';font-weight:600;font-display:swap;src:url(fonts/nunito-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:'Nunito';font-weight:800;font-display:swap;src:url(fonts/nunito-latin-800-normal.woff2) format('woff2')}
</style>
`;
html = html.replace('</head>', faces + '</head>');
if (html.length === before) throw new Error('Nothing changed; check public/index.html');
writeFileSync(join(www, 'index.html'), html);

for (const f of ['favicon.svg', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  cpSync(join(root, 'public', f), join(www, f));
}
console.log('www/ ready');
