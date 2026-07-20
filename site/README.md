# keepitmovin-site

Marketing and docs site for [keepitmovin](https://github.com/garrettsiegel/keepitmovin) — the terminal tool that hands off between AI coding agents when one hits a rate limit.

Built with [Astro](https://astro.build), fully static output (`output: 'static'`), no backend, no SSR, no UI framework. Hand-rolled CSS lives in `src/styles/design-system.css`; the browser JavaScript powers the install-command copy button, hero visuals, waitlist embed, and Vercel Analytics. Type: Instrument Sans for everything, JetBrains Mono for code/eyebrows/terminal — self-hosted via `@fontsource/*`, no Google Fonts. Design direction: quiet monochrome warm-black with the orange accent used sparingly (unabyss.com was the reference); canonical URLs, OG/Twitter cards, JSON-LD, sitemap, and robots.txt are wired to `https://www.keepitmovin.dev`.

This site lives at `site/` inside the [keepitmovin](https://github.com/garrettsiegel/keepitmovin)
repo. It is a standalone Astro package with its own `node_modules` — build it from this directory,
not through the CLI's workspace.

## Commands

Run from this `site/` directory:

```sh
pnpm install     # first time only
pnpm dev         # local dev server
pnpm build       # static build → dist/
pnpm preview     # serve the built dist/ locally
```

## Layout

- `src/pages/index.astro` — landing page (hero + live handoff sim, works-with bar, 3-step how-it-works, comparison split, tools wall, honest limitation, pricing)
- `src/pages/404.astro` — branded not-found page
- `src/pages/docs/` — docs section: overview, install, quickstart, how handoff works, supported tools, configuration, FAQ (accordion)
- `src/layouts/BaseLayout.astro` — HTML shell, meta/OG/Twitter/canonical/JSON-LD, glass pill nav, footer card
- `src/layouts/DocsLayout.astro` — docs shell with sidebar nav and active-page state
- `src/components/InstallCommand.astro` — install command with copy button
- `src/components/HandoffSim.astro` — looping typewriter simulation of a limit → handoff → resume
- `src/components/HeroFlow.astro` — animated hero backdrop and handoff flow
- `src/styles/design-system.css` — the whole design system (dark-first, light variant via `prefers-color-scheme`)
- `public/favicon.svg` — forward-motion glyph
- `public/opengraph.png` — social card, wired as `og:image` in BaseLayout
- `public/robots.txt` — allow all, points at the sitemap

The live handoff terminal in the hero (`HandoffSim.astro`) replaced the old demo GIF, so there is
no `demo.gif` to maintain.

### OG image

`public/opengraph.png` (1200×630, wordmark + one-line promise on the site background) is served
as the absolute `og:image` / `twitter:image` (`https://www.keepitmovin.dev/opengraph.png`). Re-render
it if the brand or promise line changes.

## Deploying

The site is a plain static directory: build it, upload `dist/`. It lives at `site/` inside the
keepitmovin repo, so set the project root to `site` on each host (paths below are relative to the
repo root).

### Cloudflare Pages

- **Root directory:** `site`
- **Build command:** `pnpm build` (or `npx astro build`)
- **Build output directory:** `dist`

### Netlify

- **Base directory:** `site`
- **Build command:** `pnpm build`
- **Publish directory:** `site/dist` (or just `dist` when the base directory is set)

### Vercel

- **Root directory:** `site`
- **Framework preset:** Astro (auto-detected; build command `astro build`, output `dist`)

## Domain

`astro.config.mjs` sets `site: 'https://www.keepitmovin.dev'`, which drives canonical URLs, absolute
OG/Twitter image URLs, and the `@astrojs/sitemap` output (`dist/sitemap-index.xml`). Only set
`base` if the site is ever served under a subpath.
