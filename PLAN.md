# PLAN.md — keepitmovin: evaluation & next moves

*Written 2026-07-18. Benchmarked against [unabyss.com](https://unabyss.com) and an external
opportunity analysis of agentic AI coding tools (June 18 – July 18, 2026).*

## Implementation status — 2026-07-19

- [x] Canonical `www` host, sitemap, social metadata, Vercel Analytics, Search Console hook,
  homepage FAQ/trust sections, privacy page, honest Free/Pro-early-access pricing, and CI coverage.
- [x] Tally waitlist embed support with an explicit setup-pending fallback; no fake form or demand
  data is shown before a published Tally URL exists.
- [x] Changelog, comparison pages, and four high-intent posts, including a continuity-focused
  weekly-limit article that does not promise quota evasion.
- [x] Receiver handoff receipts with a 60-second warning, session telemetry, and secret redaction.
- [x] Structured Claude/Codex compaction detection, immediate handoff refresh, and same-tool nudge.
- [x] Conservative, warning-only loop, Codex burn-rate, and no-progress watchdogs.
- [x] Read-only local MCP server plus preview/confirm installers and status/remove commands for
  supported clients; incompatible or old clients fail closed.
- [x] Verified real Claude Code → Codex demo with narration, three gallery screenshots, GitHub
  description/homepage metadata, and a protected Vercel preview deployment.
- [ ] External launch gates: create/publish the Tally form, set its Vercel environment variable,
  deploy production, set GitHub's social preview in the web UI, and submit the organic Product Hunt
  listing. The available browser session was not signed in/attached, so these account-bound steps
  were not fabricated or bypassed.

The implementation follows the chosen launch scope: Product Hunt only (no X or Show HN), `www` as
canonical, Pro price left as TBD, local MCP read-only, and watchdog actions limited to warnings.

## Context

An independent analysis of the last 30 days of agentic coding tools concluded that the clearest
open opportunity is a **vendor-neutral runtime watchdog for coding agents** — and named it "the
strongest evolution of keepitmovin/codepass." The market raced toward background agents, worktrees,
mobile control, hooks, skills, and transcript search (Cursor, Claude Code, Codex), while
reliability stayed weak: users reported 10–20× quota drain, task loss after compaction, runaway
loops, and broken resumes. The proposed product:

1. Detects abnormal usage, stalls, loops, and approaching limits
2. Checkpoints objectives, decisions, git state, tests, and next actions
3. Switches to another agent automatically
4. Verifies the receiving agent understood the handoff

Positioning: *"Your coding agent crashed, hit a limit, or lost the plot. Keep working without
re-explaining."*

keepitmovin already is most of that product. This document evaluates where it stands, what
Unabyss — a Product Hunt Product-of-the-Month winner in the adjacent "context layer" space — is
doing right that keepitmovin is not, and lays out a tiered plan.

## Where keepitmovin stands today

**The product is real and the distribution is zero.** That is the single most important fact in
this document.

- **Product:** v2.0.1, renamed from codepass on 2026-07-18. Nine fully supported tools, layered
  limit/failure detection with prose guards, Codex pre-emptive usage checks, live-refreshed
  `handoff.md`, manual switch (`Ctrl+]`), setup wizard, doctor, session telemetry. MIT, local-only,
  no extra AI calls.
- **Site:** live at [www.keepitmovin.dev](https://www.keepitmovin.dev) (Astro on Vercel) — homepage
  with handoff simulation, 6 docs pages, pricing section. But `site:` is commented out in
  `site/astro.config.mjs`, so there are no canonical URLs and no sitemap.
- **Distribution (checked 2026-07-18):** 0 GitHub stars, 0 forks, 0 issues. npm downloads API
  returns "package not found" for the last month (the package is a day old under this name).
- **Launch assets:** `marketing/product-hunt.md` and `marketing/launch-thread.md` are drafted but
  never shipped. The gallery/asset checklist is entirely unchecked.
- **Monetization:** the site advertises a ~$9/mo Pro tier ("coming soon") whose waitlist is a
  `mailto:` link — near-zero conversion and no demand measurement.

## What Unabyss is doing right (and what transfers)

Unabyss is an MCP-native "self-updating context layer" SaaS — a different product in an adjacent
category (personal context for all your AIs, vs. keepitmovin's coding-session continuity). The
lessons transfer even where the product doesn't.

| # | What Unabyss does | Evidence | What keepitmovin should take from it |
|---|---|---|---|
| 1 | **Launched hard** | PH Product of the Day, Week, *and* Month badges above the fold; "500,000+ items synced"; "Backed by" investors | Actually ship the drafted PH launch + X thread + Show HN. Everything else on this list compounds only after launch. |
| 2 | **Charges from day one** | $13/mo Pro, $79/mo Max, Team custom; 7-day trial, "No credit card required"; even targets "On the Claude Max plan? This is the pick for you." | Don't paywall the CLI, but make the Pro waitlist a real signal-measuring funnel instead of a `mailto:`. |
| 3 | **Bet on the MCP standard, not per-tool glue** | "Add Unabyss to Claude in three steps" — a custom MCP connector; works with 10+ AI tools through one protocol | Strategic option for kim: serve live handoff context over a local MCP server so tools pull it natively (Tier 3). |
| 4 | **Handles objections on the homepage** | "Before you ask" FAQ; a direct attack on static context files: *"A context file works — until it goes stale… frozen the moment you write it."* | Put a FAQ on kim's homepage, and answer that exact attack: kim's handoff file is **live-refreshed by the working agent**, local, free, and costs no extra AI calls. |
| 5 | **Comparison + segment pages as SEO surface** | vs. built-in memory / vs. context files / vs. build-your-own; Founders/Builders/Agencies/GTM pages; active blog (posts July 6–8, 2026); changelog; jobs page | Build kim's equivalents: comparison pages, a changelog page (CHANGELOG.md already exists), and 2–4 high-intent SEO posts. |
| 6 | **Sells trust explicitly** | AES-256 at rest, TLS 1.3, per-app OAuth scoping, SOC 2 Type II (in progress) | kim's story is *stronger* for developers — nothing leaves your machine, secrets are redacted, artifacts are gitignored, MIT — and it's currently unsold on the site. |
| 7 | **Shows, with sound** | Real video demos ("Tap for sound — Unabyss in Claude / in ChatGPT"), before/after split panes, a 3-step connect flow with actual UI | Record a real terminal demo video of a handoff (the README GIF is a start; the site's `HandoffSim` is good but simulated). |

**What NOT to copy:**

- Don't pivot into a general personal-context layer (Slack/Gmail/Notion ingestion). It's a
  different, crowded product with heavy trust requirements; kim's niche — coding-session
  continuity and reliability — is defensible and underserved.
- Don't paywall or SaaS-gate the CLI. Local-first, open source, and free is the trust wedge
  Unabyss can't match.

## Gap matrix vs. the watchdog opportunity

| Opportunity spec item | keepitmovin today | Gap |
|---|---|---|
| Detects approaching limits | Codex on-disk usage checks (pre-launch + periodic); usage-warning guard on output | Only Codex. Investigate signals for other tools; treat "approaching" as a first-class switch trigger. |
| Detects limit hits / crashes / auth failures | Yes — layered detection (`failure-detection.ts`, `errors.ts`, curated `limitPatterns`) with prose guards | Core strength. Keep. |
| Detects stalls | Idle timeout in `harness-session.ts` | Partial. "Alive but not progressing" (streaming output, no file/git change for N min) is undetected. |
| Detects runaway loops | Nothing | **Missing.** Repetition detection over `RollingTranscript` (repeated output cycles / same failing command re-run). |
| Detects abnormal usage burn (10–20× drain) | Nothing | **Missing.** Burn-rate deltas between usage checks (Codex first) → warn or switch early. |
| Guards against compaction task loss | Handoff refresh interval | Partial. Detect compaction banners in output and force a checkpoint immediately. |
| Checkpoints objectives/decisions/git/tests/next | Yes — `handoff-file.ts`, `handoff-refresh.ts`, git status/diff, transcript excerpts | Core strength. Tests state is the weakest section — consider capturing last test command + result. |
| Switches automatically | Yes — the whole harness loop | Core strength. Keep. |
| **Verifies the receiver understood the handoff** | No. `handoff-quality.ts` scores whether the *sender* recorded the task, not whether the receiver got it | **Missing, and the most differentiating item.** No competitor claims "verified handoffs." |

Conclusion: keepitmovin is ~60% of the watchdog spec, and 100% of the switching/checkpointing
half. The missing 40% is exactly the "watchdog" half — and it's also the better story:
crashed / limited / **lost the plot**, not just limits.

## Tier 1 — Launch & conversion (days)

Ordered; 1–3 are the ones that matter most.

1. **Launch.** Finish the `marketing/product-hunt.md` asset checklist (thumbnail, demo video with
   sound, 2–3 screenshots: wizard, "Switching tools" moment, a handoff file). Ship Product Hunt,
   the drafted X thread (`marketing/launch-thread.md`), and a Show HN — while the 2.0 rename is
   fresh and the npm package history is clean.
2. **Fix the funnel.** Replace both `mailto:` CTAs in `site/src/pages/index.astro` with a real
   email-capture form (Buttondown/Tally/Formspark or a tiny Vercel function). This is also the
   only way to measure Pro demand before building it (see Tier 3).
3. **SEO plumbing.** Uncomment `site: "https://keepitmovin.dev"` in `site/astro.config.mjs`
   (confirm the canonical host — the apex currently 308s to `www.`), add `@astrojs/sitemap`, and
   OG/social meta in `site/src/layouts/BaseLayout.astro`.
4. **Homepage FAQ + counter-positioning.** Surface the top 5 objections from `site/src/pages/docs/faq.astro`
   on the homepage. Add the anti-"stale context file" answer: the handoff is live-refreshed by the
   working agent every session — it can't go stale, and it costs nothing extra.
5. **Trust section.** One homepage section: local-only, zero extra AI calls, secret redaction,
   `.keepitmovin/.gitignore`, MIT. Link `SECURITY.md`.
6. **SEO surface.** Add a `/changelog` page (render `CHANGELOG.md`), comparison pages
   (vs. copy-pasting context, vs. tmux + scripts, vs. context layers like Unabyss — honest about
   the category difference), and 2–4 posts targeting high-intent queries: "claude code 5 hour
   limit", "claude code weekly limit workaround", "codex usage limit", "switch from claude code to
   codex mid task". kim is the literal answer to those searches.
7. **Social proof plumbing (post-launch).** PH badge, GitHub stars/npm downloads once they're
   non-embarrassing; until then the demo video is the proof.

## Tier 2 — Product: become the watchdog (weeks)

The gap-matrix items, in order of differentiation-per-effort:

1. **Handoff verification (receiver ACK).** After launching the next tool, require it (via the
   handoff prompt) to write a short restatement of the goal into a `## Received` section of
   `handoff.md`; extend `handoff-quality.ts` to score it and surface "handoff verified ✓" in the
   interstitial and session log. Ship this before the others — it's the marketable claim.
2. **Loop/runaway detection.** New failure family in `failure-detection.ts` over
   `RollingTranscript`: repeated near-identical output blocks or the same failing command N times.
   Apply the same conservatism as the existing prose guards (see CLAUDE.md gotchas) — a
   false-positive switch is worse than a missed loop. Start as a warning, promote to a switch
   trigger behind config.
3. **Compaction guard.** Recognize compaction banners (per-tool, curated in the provider catalog
   like `limitPatterns`) and immediately force a handoff refresh/checkpoint.
4. **Abnormal-burn detection.** Track usage-percentage deltas between Codex usage checks; warn or
   pre-emptively switch on runaway burn. Investigate equivalent local signals for other tools; fail
   soft where none exist.
5. **Stall detection v2.** "Streaming but stuck": output flowing, but no file changes / git delta /
   handoff updates for N minutes → warn, offer switch.
6. **Reposition.** Broaden the headline from limits to the full watchdog claim across README,
   site hero, and PH copy: *"Your coding agent crashed, hit a limit, or lost the plot. Keep working
   without re-explaining."* — limits stay the concrete lead example.

## Tier 3 — Strategic bets (evaluate, don't commit)

- **`kim mcp` — serve continuity over MCP.** A local MCP server exposing the live handoff (and
  session history) as resources/tools, so Claude Code, Cursor, Codex, etc. can pull continuity
  context natively even when *not* launched inside kim. This applies Unabyss's architecture lesson
  to kim's niche, reduces reliance on prompt-transport fragility, and answers "files go stale"
  permanently. Decide after launch feedback.
- **Cloud handoff sync (Pro, ~$9/mo).** Already advertised; **do not build until the Tier-1
  waitlist form shows real demand.** Until then, keep the pricing card honest ("early access
  waitlist", no fake ship dates).
- **Team tier.** Parked. Revisit only if orgs show up asking.

## Open items for Garrett

1. **Launch timing** — PH launches are date-sensitive; pick a weekday and work the checklist
   backward from it.
2. **Canonical host** — `keepitmovin.dev` vs `www.keepitmovin.dev` (apex currently 308s to www);
   pick one before setting `site:`.
3. **Pricing card honesty** — keep advertising Pro pre-build (with a real waitlist), or drop the
   card until it exists.

## Verification

- Tier 1 site changes: `pnpm --filter keepitmovin-site build` (from `site/`), then check canonical
  tags/sitemap in `dist/`, and the deployed Vercel preview.
- Tier 2 detection changes: keepitmovin's own gotcha tests — "prose mentions a limit → no switch",
  "percentage warning → no switch", "real banner → switch", plus new fixtures for loops/compaction;
  `pnpm --filter keepitmovin build && test && lint`.
- Launch: measured by the funnel itself — PH listing live, waitlist submissions recorded, npm
  weekly downloads > 0.
