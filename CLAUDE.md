# Tinsel Patrol

## Rule: always use the design system and style guide

Whenever you create or change any Tinsel Patrol asset or collateral (game UI, icons, favicon, Open Graph / Twitter images, social posts, slides, docs, emails, store art, marketing copy), you MUST first consult the design system and style guide and follow them:

- Design system and style guide (Claude artifact): https://claude.ai/artifact/JGR4VsaNdZA43QxcQc7LVa. Read `project/README.md` (voice, colour, type, layout, motion, iconography) and `project/tokens.json`.
- Use only its tokens (colours, fonts, spacing, radii, shadows), voice and copy rules, and the approved marks in `brand/`. Do not approximate the mark or invent new colours.
- Share images are built from `brand/share-card.html`; icons from `brand/mark.svg` and `brand/mark-small.svg`.
- Game palette variables in `src/tinsel-patrol.html` must stay in sync with the tokens.
- If the system lacks something you need, update the design system first, then use it.
- Finish by checking the output against the style guide.

Workflow: edit `src/tinsel-patrol.html`, run `python3 build.py`, commit and push to `main` (Cloudflare deploys automatically).
