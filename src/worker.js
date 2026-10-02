// Tinsel Patrol: global high-score API on Cloudflare Workers + D1.
// Static files in ./public are served by the assets binding; only /api/* runs this code.
const MAX_SCORE = 100000;
const TOP_N = 10;
const BLOCKED = /(fuck|shit|cunt|nigg|fag|rape|nazi|hitler|bitch|whore|slut|dick|cock|penis|vagina|porn)/i;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

let ready;
function init(db) {
  ready ||= db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, score INTEGER NOT NULL, created INTEGER NOT NULL, ip TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC, created ASC)'),
  ]).then(() => db.prepare('ALTER TABLE scores ADD COLUMN wave INTEGER').run().catch(() => {})); // no-op once the column exists
  return ready;
}

async function top(db) {
  const { results } = await db
    .prepare('SELECT id, name, score, wave FROM scores ORDER BY score DESC, created ASC LIMIT ?')
    .bind(TOP_N)
    .all();
  return results;
}

async function hashIp(ip) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tinsel:' + ip));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

function cleanName(raw) {
  let n = String(raw ?? '').normalize('NFKC').replace(/[^\p{L}\p{N} ._'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 12);
  if (!n || BLOCKED.test(n.replace(/[ ._'-]/g, ''))) n = 'Anon Cat';
  return n;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Share landing page: /s/<score> gives Facebook a score in the preview, then sends people to the game.
    const m = url.pathname.match(/^\/s\/(\d{1,6})$/);
    if (m) {
      const n = Math.min(Number(m[1]), MAX_SCORE);
      const title = `I scored ${n} on Tinsel Patrol`;
      const desc = 'Reckon you can beat it? Tap the cats before they tear down the Christmas tree. Free to play, no download.';
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<meta property="og:type" content="website"><meta property="og:site_name" content="Tinsel Patrol">
<meta property="og:url" content="https://tinselpatrol.com/s/${n}"><meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}"><meta property="og:image" content="https://tinselpatrol.com/og-image.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=/"></head><body><a href="/">Play Tinsel Patrol</a></body></html>`;
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    }
    if (url.pathname !== '/api/scores') return env.ASSETS.fetch(request);
    if (!env.DB) return json({ error: 'scoreboard unavailable' }, 503);

    try {
      await init(env.DB);

      if (request.method === 'GET') return json({ top: await top(env.DB) });

      if (request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
        const score = Number(body?.score);
        if (!Number.isInteger(score) || score < 1 || score > MAX_SCORE) return json({ error: 'bad score' }, 400);

        const ip = await hashIp(request.headers.get('cf-connecting-ip') || 'unknown');
        const now = Date.now();
        const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE ip = ? AND created > ?').bind(ip, now - 15000).first();
        if (recent && recent.n > 0) return json({ error: 'slow down' }, 429);

        const name = cleanName(body?.name);
        const w = Number(body?.wave), wave = Number.isInteger(w) && w >= 1 && w <= 999 ? w : null;
        const ins = await env.DB.prepare('INSERT INTO scores (name, score, created, ip, wave) VALUES (?, ?, ?, ?, ?)').bind(name, score, now, ip, wave).run();
        const id = ins.meta.last_row_id;
        const rank = (await env.DB.prepare('SELECT COUNT(*) + 1 AS r FROM scores WHERE score > ?').bind(score).first()).r;
        return json({ id, name, rank, top: await top(env.DB) }, 201);
      }

      return json({ error: 'method not allowed' }, 405);
    } catch (e) {
      return json({ error: 'scoreboard error' }, 500);
    }
  },
};
