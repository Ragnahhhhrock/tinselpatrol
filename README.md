# Tinsel Patrol

Defend the Christmas tree from cats. Live at https://tinselpatrol.com

- `public/` is the website, served as static files by the `tinsel-patrol` Cloudflare Worker.
- `src/tinsel-patrol.html` is the game source. After editing it, run `python3 build.py` to regenerate `public/index.html` and the site metadata.
- `wrangler.jsonc` tells Cloudflare to publish `public/`. Cloudflare runs `npx wrangler deploy` on every push to `main`.
- `src/og-card.html` is the layout used to render `public/og-image.png`.
