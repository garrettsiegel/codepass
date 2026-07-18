# GAMEPLAN.md — Project History

> **Historical document.** The product was renamed **keepitmovin** (command `kim`) in July 2026.
> Earlier names in this file — "CodePass" and, before that, "relay" — are the names it had at the
> time; they're preserved here as history, not current usage. For today's docs see the README.

This file is the project's planning history, combined into one place: the original product brief,
the harness design vision, and the V1 execution log. It exists so anyone (including a future agent
or Garrett six months from now) can trace *why* CodePass looks the way it does without digging
through old chat logs.

**Status: V1 shipped.** Everything in Part 3 (the execution log) is done. For how to actually use
or contribute to CodePass today, see [README.md](./README.md) (usage) and [CLAUDE.md](./CLAUDE.md)
(architecture, build/test, gotchas) — this file is history, not living documentation.

## Contents

1. [Original Product Brief](#part-1--original-product-brief) — the initial request that started the project.
2. [Harness Vision](#part-2--harness-vision) — the design plan for the interactive harness (largely fulfilled).
3. [V1 Execution Log](#part-3--v1-execution-log) — the T1–T8 work order that took CodePass from prototype to V1, with what actually happened at each step.

---

## Part 1 — Original Product Brief

*This is the original request that defined CodePass's purpose. Preserved as written.*

### Summary

CodePass is a harness that helps users seamlessly move between tools and carrying the context of what they are working on with them.

An example of tools are the following: Claude Code, Codex, Antigravity CLI, Opencode, Ollama local models a user may have.

A user may want to switch tools during working on tasks. Here is an example of my current painpoint: I am working in Claude Code on a task, but I have a use case for part of it that would be better suited for the Codex CLI. If I switch from Claude Code to Codex, nothing carries with it. I lose all context of what I'm working on.

Another example of the pain-point: I am deep in a task working in Claude Code (I have a $20 monthly pro plan) and my 5 hour rate limit gets hit. Now I want to switch to Codex or Antigravity or another tool, but my context of my chats that I've been working on doesn't carry over into that new tool.

CodePass bridges that gap.
The goal is that CodePass is a wrapper or a harness around these tools (a box for them so-to-speak) that keeps a lean "handoff" markdown file for each session. This lean handoff file gets regularly and dynamically updated by the users current tool they are working in, to keep the handoff file aware of what's being worked on and any other important information in the user's chat.

If a user decides to switch tools, or if the user gets rate limited, it switches to another tool and the handoff gets passed to the new tool and the new tool has full access to it because it's in the same harness/box.

The user can choose to switch tools at any time, but upon starting codepass they setup their desired stack.

For example:
The user chooses 1. Claude Code, 2. Codex, 3. Opencode, 4. Ollama.
If the user chooses manually to change tools - they can choose any tool they'd like from the list of available tools, but if the user is working in Claude Code and they get rate limited by hitting their rate window, the CodePass harness automatically moves the user into the next tool - passing the handoff with them, keeping their momentum moving.

This starts with a CLI. It should be something like installing:
npx (or npm) i codepass

from there, they will get a CLI introduction to the tool and choose their stack. CodePass should make sure that they are using the latest version of the tools upon selecting.

It will prompt the user either to login for paid plans (by a link to login via the terminal) or add their API key if they are using an API.

once logged in, the user's tool will open and they can begin using it just like normally.

There should be a command to switch tools thats present in the cli so that the user can see what that command is at any time.

I would like to know if there is a way to detect the users usage for these tools intead of relying on keywords to detect rate limiting. However, currently it relies on keywords.

If a user gets rate limited. The user gets a short message, a commercial break so-to-speak (this could be a cool way to add some fun), where the tool gets switched to the next tool. The new tool will be populated with a message that the user has just moved into this tool from the previous and here is the handoff file as a context of what they were working on. Please continue.

I am concerned about the excess tokens this will cost the user on top of their usage, so we need to find a way to keep the token usage of this to a bare minimum.

Right now, lets only focus on optimizing for the following tools:
- claude code
- codex
- antigravity CLI
- opencode
- openrouter
- ollama
- if cline has a CLI that's easy to install add that too

I can add more later if desired.

For all of these tools, CodePass needs to know how to detect if the user has been rate limited.

The CLI should be very simple and understandable, it should use clack for a nice experience. People who aren't devs probably won't use but should be able to understand how to use it. Clear/concise instructions and flow. Help the user along to understand what to do.

The handoff file should be as minimal as possible while making sure key information is dynamically added throughout the users chat. At every stopping point in the user's chat it should determine whether to add anything to the handoff file. I'm not sure the best way to do this but it needs to be minimal and light, not adding a ton of context and/or tokens to the user's experience. What is the best way to handle this? It would be a good idea to do some research and find out.

Handoff files should be saved locally for the user, and there should be an option in the cli settings to clear them if the user desires.

There should be clear and simple instructions/documentation for the user.

the user should simply be able to type in codepass into their terminal once installed and then it will open.

They should have the option like it is currently present to start new or use the previous settings.


The main goal here is to create a seamless experience where i can switch tools and keep my work going without having to redo things and lose context. I want a good user and developer experience.

Keep it very simple, and easy to use. Minimal, anyone should be able to use it with ease.

the code for this project should be minimal, clean, no files should be over 200-250 LOC unless absolutely necessary. no nested functions. easy to understand so that any junior dev can understand what the code does. Concise comments where useful.

Remove any unnecessary code or files.

Please make sure that the CLAUDE.md and README.md are up to date with the latest information needed.

---

## Part 2 — Harness Vision

*This was the design plan for turning the original prototype (a non-interactive task-fallback CLI)
into the interactive harness described above. Most of it shipped as written; a few specifics (exact
provider CLI flags, live usage-based limit detection instead of keyword patterns) were adjusted
during implementation — see Part 3 for what actually happened.*

### Summary

CodePass should become a simple interactive harness, not primarily a task-only fallback CLI.

The intended user experience is:

```sh
codepass
```

CodePass then walks the user through setup, login checks, provider order selection, and starts the first chosen coding tool inside the CodePass harness. If that tool hits a limit or fails, CodePass automatically creates a handoff and switches to the next configured tool.

### Product Direction

- Replace "run one non-interactive task" as the main UX with "start one guided coding session."
- Keep the current task runner as a useful fallback mode, but make the primary command `codepass`.
- First-run experience should feel like:
  - Welcome screen
  - Detect installed tools
  - Help user log in or configure API keys
  - Ask which tools/models to use and in what order
  - Save that preference
  - Launch the first provider
- Example chosen chain:
  - Claude Code
  - Codex
  - Cline using DeepSeek V4 Flash through OpenRouter
- During a session, CodePass should explain what is happening in plain language:
  - "Starting Claude Code"
  - "Claude appears rate-limited"
  - "Preparing handoff for Codex"
  - "Starting Codex with your current project context"

### Feasibility Notes

- This is possible as a PTY-based terminal harness: CodePass can spawn `claude`, `codex`, or `cline` as child terminal processes and keep the user inside one CodePass-controlled experience.
- CodePass can detect many limit/failure events by watching provider output for known patterns like rate limits, quota errors, auth failures, or process exits.
- CodePass cannot reliably copy the private internal conversation state from one provider to another unless that provider exposes it through a supported API.
- CodePass can still preserve useful continuity by building a handoff from:
  - current working directory
  - git status and diff
  - recently changed files
  - terminal transcript excerpts
  - user's original intent
  - provider failure reason
  - project instructions like `AGENTS.md`
- Claude Code supports interactive sessions, resume/continue behavior, background sessions, auth status, and remote-control-related commands.
- Codex supports interactive CLI mode, `exec`, `resume`, `doctor`, login, model selection, and local-provider options.
- Cline support should be treated as plugin/provider work because `cline` is not currently installed on PATH here.

### Key Implementation Changes

- Add a new interactive `codepass` command flow:
  - If no config exists, start setup wizard.
  - If config exists, show chosen provider chain and start the harness.
- Add setup wizard:
  - Check `claude auth status` or equivalent.
  - Check `codex doctor` / `codex login`.
  - Check whether `cline` exists.
  - Ask for OpenRouter configuration only if the user chooses a Cline/OpenRouter-backed model.
  - Save provider chain and model choices in local CodePass config.
- Add provider harness abstraction:
  - `InteractiveProvider` with `start`, `detectFailure`, `buildHandoff`, and `resumeOrLaunch` behavior.
  - Run providers in a pseudo-terminal so interactive tools still feel native.
  - Maintain a rolling transcript buffer for diagnostics and handoff.
- Add automatic handoff:
  - On rate limit or quota failure, stop or detach the current provider.
  - Generate a plain-language handoff prompt.
  - Launch the next provider with that handoff.
  - Tell the user exactly what happened.
- Add user-facing DX:
  - `codepass doctor`: setup health check.
  - `codepass setup`: rerun wizard.
  - `codepass providers`: edit provider order.
  - `codepass session`: show current/last session summary.
  - Friendly explanations instead of raw config-first UX.

### UX Acceptance Criteria

- A new user can type `codepass` and be guided without reading docs first.
- CodePass explains what Claude, Codex, Cline, and OpenRouter setup steps are needed.
- The user can choose provider order without editing JSON.
- CodePass launches the first provider automatically after setup.
- If the first provider hits a recognizable limit, CodePass switches to the next provider and explains the handoff.
- The user can always see where logs/session summaries are saved.
- Advanced users can still configure details manually.

### Test Plan

- Unit tests for setup-state detection and provider-chain config.
- Unit tests for rate-limit/failure pattern detection.
- Integration tests with fake PTY providers that simulate:
  - normal session exit
  - Claude-style rate limit output
  - Codex-style auth failure
  - missing Cline command
  - fallback to next provider
- Snapshot tests for setup wizard copy and handoff prompt copy.
- Manual smoke test:
  - Run `codepass`
  - Choose Claude -> Codex
  - Simulate Claude failure
  - Confirm CodePass launches Codex with generated context

### Assumptions

- The main goal is maximum ease of use, even if the first harness version is less technically perfect than true live-session transfer.
- CodePass should prefer guided prompts over JSON editing.
- Exact session transfer is not guaranteed; practical continuity through handoff summaries is the V1 harness target.
- Current docs/CLI evidence:
  - Claude Code CLI supports interactive start, `--continue`, `--resume`, auth commands, and background/remote-control features.
  - Codex CLI supports interactive mode, `exec`, `resume`, `doctor`, `login`, model selection, and local-provider options.
  - Cline is not currently installed on PATH in this workspace.

---

## Part 3 — V1 Execution Log

*This is the work order that took CodePass from the state described in Parts 1–2 to a shipped V1 —
removing the non-interactive task mode Part 2 said to keep (it turned out to conflict with "keep
files under 250 LOC" and "minimal" from the brief), trimming the provider catalog to the brief's
7 tools, adding real per-provider rate-limit detection, and getting the package ready to publish.
Tasks were split between models by risk: Opus for anything touching the config contract, detection
logic, or carrying regression risk; Sonnet for mechanical, pattern-following, or docs work. Every
task below is complete.*

### Ground Rules (that applied throughout)

- V1 is the **interactive harness only**. Task mode was removed (T1).
- Files stay **≤ 250 LOC**, no nested functions, junior-readable, concise comments only where useful.
- ESM throughout: explicit `.js` import specifiers.
- The zod schema in `src/config.ts` is the config contract; `src/types.ts` mirrors it.
- `src/provider-catalog.ts` is the single source of truth for tool details — never scatter provider
  info across files.
- After every task: `pnpm build`, `pnpm test`, `pnpm lint` (from the package directory) all had to
  pass before checking a task off. After the final task, the monorepo's root Turborepo build also
  had to pass (this repo was developed inside a personal monorepo at the time — see the note in
  README.md about how that no longer matters day-to-day).
- Structural decisions were recorded in the monorepo's root `AGENTS.md` Notable Decisions log as
  they happened.

### T1 — Remove task mode · Opus ✅

PLAN.md describes only the interactive harness; the non-interactive `codepass run "task"` mode was
legacy. Removing it touched the config contract, the barrel, and CLI wiring. Actual blast radius was
larger than first written — task mode also pulled in `prompt.ts`, `handoff.ts`, `context.ts`, and
`logger.ts` (all task-only; distinct from the harness's `handoff-file.ts`).

- Deleted `src/run.ts`, `src/provider.ts`, `src/prompt.ts`, `src/handoff.ts`, `src/context.ts`,
  `src/logger.ts` and tests `test/run.test.ts`, `test/prompt.test.ts`, `test/handoff.test.ts`.
- Removed the `run` command block from `src/cli.ts` plus its `runCodePass`/`RunAttemptLog`
  imports and the orphaned `formatAttempt`/`parseMaxRetries` helpers; simplified `normalizeArgv`
  (no longer reroutes bare args to `run`; bare `codepass` launches the harness).
- Removed task-mode exports + types from `src/index.ts`.
- `src/config.ts`: removed `providerConfigSchema`, the top-level `providers` array, `maxRetries`,
  the whole `git` section, and the unused `context` sub-flags / `logs.fullProviderOutput`; kept
  top-level `fallbackOn` (harness uses it) and `context.maxDiffChars`. `defaultConfig()` now
  parses `{}`. Dropped the now-dead `DEFAULT_TIMEOUT_MS`.
- `src/types.ts`: removed `ProviderConfig`, `TaskContext`, `AttemptSummary`, `ProviderResult`,
  `ProviderRunOptions`, `RunOptions`, `RunAttemptLog`, `RunLog`, `RunSummary`.
- `src/provider-catalog.ts`: removed `getDefaultTaskProviders` + `ProviderConfig` import
  (`taskArgs` entry fields left for T2, later fully removed in T8).
- `src/doctor.ts`: dropped the redundant task-mode `providerHealth`/`readyProviderCount`
  (now uses `interactiveProviderHealth`/`readyInteractiveProviderCount` from `harness.providers`);
  updated the CLI doctor renderer accordingly.
- `src/git.ts`: removed the task-only `createCheckpointCommit` (kept `execa`, still used by `runGit`).
- Updated `codepass.config.example.json` (dropped removed sections; trimmed harness providers to
  the real catalog set: claude, codex, cline, antigravity, opencode).
- Updated `test/config.test.ts`, `test/doctor.test.ts`, `test/provider-catalog.test.ts`. Also
  fixed two pre-existing failures in the initial commit (tests referenced `aider/goose/kiro/amp`,
  which were never in the catalog) so the suite is green.
- `execa` kept (used by doctor/setup/updates/git). Verified: build, lint, and 46/46 tests pass;
  `dev doctor` reports 4 ready harness providers.

### T2 — Trim catalog to PLAN scope; add ollama & openrouter · Sonnet ✅

PLAN.md targets exactly: claude code, codex, antigravity, opencode, openrouter, ollama, cline.

- Deleted the `gemini`, `github-copilot`, `cursor`, `devin`, `openhands`, `continue`, `roo-code`
  entries from `src/provider-catalog.ts`.
- Added `ollama`: harness group, `pty_with_bootstrap_input`, disabled by default (parallels
  `cline` — not everyone has it installed/pulled a model), command `ollama run llama3.2` with the
  handoff pasted in via bootstrap input (same pattern as `antigravity`). `limitation` documents
  that it's a plain chat REPL (no autonomous file edits) and that failures are usually the daemon
  being down (`connection refused`), not a rate limit — feeds directly into T3.
- Added `openrouter`: guided group, `external_app`, `controllable: false` — it's a model gateway
  reached through opencode/Cline config, not a launchable CLI, so it's not offered in the harness
  stack picker.
- Updated `test/provider-catalog.test.ts`, `test/doctor.test.ts`, `test/setup.test.ts` for the
  new catalog.
- Verified: build/lint/test all pass (46/46); `dev providers` lists exactly claude, codex,
  antigravity, opencode, ollama as selectable harness tools + cline (disabled), matching PLAN.md's
  7-tool scope; `dev doctor --all` shows `ollama` with a live "daemon not running" warning and
  `openrouter` as a guided setup-guide row.

### T3 — Per-provider rate-limit detection · Opus ✅

PLAN.md: "For all of these tools, CodePass needs to know how to detect if the user has been rate
limited." The generic keyword list in `src/errors.ts` needed to become tool-specific without
weakening the existing prose-vs-real-failure guard (this was the riskiest task in the whole plan).

- Added optional `limitPatterns?: string[]` to the catalog entry type, `interactiveProviderConfigSchema`,
  and `InteractiveProviderConfig`, propagated through `mergeCatalogInteractiveProviders` so saved
  configs re-hydrate the catalog's patterns.
- Seeded `claude` (`"5-hour limit reached"`, `"upgrade to increase your usage limit"`,
  `"you've reached your usage limit"`) and `codex` (`"you've hit your usage limit"` + variants).
  Left antigravity/opencode/cline/ollama empty — their exact banners weren't verified, and the
  generic detector already covers the common families. Did **not** add ollama
  `"connection refused"`: that's a daemon-down failure, not a rate limit — misfiling it as
  `rate_limit` would be wrong.
- **Key design decision:** generic patterns stay gated by a prose-vs-status-line guard (only
  trusted when the line reads like a status/error line, not ordinary agent prose); a provider's
  curated `limitPatterns` are exact, maintainer-vouched banners, trusted on a *direct* substring
  match. This is what makes the feature add value — it catches distinctive banners that the
  generic status-line heuristic would otherwise filter out, without opening a new false-positive
  surface (the banners are specific enough that they can't appear in ordinary prose).
- Tests both directions: a provider banner the generic patterns would miss → switch; a provider
  with `limitPatterns` but the agent merely discussing limits in prose → no switch (guard intact);
  banner present but `rate_limit` excluded from that provider's `fallbackOn` → no switch. 53 tests
  pass.

### T4 — Single prompt library: migrate @inquirer → clack · Sonnet ✅

PLAN.md says the CLI should use clack. Both `@clack/prompts` and `@inquirer/prompts` were
installed; inquirer was used in `src/switch-menu.ts` and `src/cli.ts`.

- Rewrote the provider select in `src/switch-menu.ts` on `@clack/prompts`. A cancel (Ctrl+C during
  the switch menu) now resolves to `undefined` — the harness already treats that as "stop, no
  switch" gracefully.
- Replaced the inquirer `select`/`confirm` in `src/cli.ts` with clack equivalents (same
  `isCancel` idiom the setup wizard already used).
- Removed `@inquirer/prompts` from `package.json`.
- Added `test/switch-menu.test.ts` for `chooseSwitchProvider`'s deterministic 0/1-choice fast
  paths.
- Verified: 55 tests pass; `clear --yes` works end-to-end; non-TTY stdin into an unconfirmed
  prompt exits rather than hangs.

### T5 — "Commercial break" switch interstitial · Sonnet ✅

PLAN.md wants a short, fun "commercial break" message while CodePass swaps tools.

- Added `renderCommercialBreak(fromLabel, toLabel, reason)` to `src/terminal-ui.ts`, reusing the
  existing box-drawing helper. Copy varies by reason (rate limit / quota / auth / timeout / manual
  switch), falling back to a generic line for anything else.
- Wired it into the harness at the switch point, replacing the old one-line message.
- Caught and fixed a real layout bug during manual testing: the first draft's copy was long
  enough to overflow the box (which doesn't wrap text), breaking the border — tightened the copy
  rather than adding wrapping logic.
- Verified: 57 tests pass; ran a real end-to-end harness run with a fake PTY emitting Claude's
  actual `"5-hour limit reached"` banner — confirmed the box renders once, cleanly, immediately
  before the next tool's intro.

### T6 — LOC-limit refactor (≤250 LOC per file) · Opus for harness.ts, Sonnet for the rest ✅

Pure extraction — zero behavior change, tests pass unchanged.

- **`src/harness.ts` (600 → 150 LOC)**, split into three modules: `src/failure-detection.ts`
  (144 LOC — live/post-exit failure classification, the prose guard, manual-switch key mapping),
  `src/harness-session.ts` (200 LOC — `waitForProvider` and its PTY lifecycle plumbing), and
  `src/pty-factory.ts` (116 LOC — the PTY adapter and node-pty/pipe-fallback factories, a shared
  dependency of the other two). `harness.ts` keeps `runHarness` and re-exports the PTY types so
  test imports didn't need to change.
- **`src/cli.ts` (402 → 99 LOC)**: each command's action body moved into `src/commands/<name>.ts`;
  shared option parsing moved to `src/cli-options.ts`; `cli.ts` now only wires commander commands
  to their handlers.
- **`src/setup.ts` (403 → 143 LOC)**: split along the real seams — tool-availability detection
  into `src/tool-status.ts` (169 LOC), clack prompt-building helpers into `src/setup-prompts.ts`
  (89 LOC).
- **`src/provider-catalog.ts` (309 → 108 LOC)**: the `PROVIDER_CATALOG` data array moved into
  `src/provider-catalog-data.ts` (211 LOC, mostly data); the original file keeps the functions.
- **`src/updates.ts` (273 → 129 LOC)**: runner primitives moved into `src/update-runner.ts`
  (162 LOC); `updates.ts` keeps the orchestration + spinner UI.
- **`src/doctor.ts` (265 → 94 LOC)**: health-check primitives moved into `src/provider-health.ts`
  (173 LOC); `doctor.ts` keeps `runDoctor`'s orchestration.
- Noted but deliberately not fixed: `provider-health.ts` and `update-runner.ts` each have their
  own near-duplicate `checkProviderCommand` (same "run `--version`, classify availability" logic,
  different return shapes) — a reuse cleanup with real behavioral surface, out of scope for a
  zero-behavior-change refactor.
- Verified: every file ≤250 LOC except (at the time) `harness.ts`, later also fixed; all tests
  pass unchanged; manually smoke-tested every CLI command post-split.

### T7 — npm publish prep · Sonnet ✅

PLAN.md installs via `npm i codepass`. Prepped the package (did not publish).

- `package.json`: removed `"private": true`; set version `1.0.0`; added `description`, `keywords`,
  `homepage`, `repository`, `license: MIT`, `author`, `engines`, `files`, `prepublishOnly`.
  **The license was a real decision, not an engineering default** — no LICENSE file existed and no
  convention was set anywhere in the repo, so this was asked of Garrett rather than assumed; he
  chose MIT. Added a standard MIT `LICENSE` file.
- Confirmed `bin`/`main`/`types`/`exports` all still resolved to real `dist/` files after T6's
  splits.
- **Found and fixed a real bug**: `npm pack --dry-run` showed six stale `dist/*.js` files left
  over from before T1 deleted those source files — `tsc` doesn't clean removed outputs on an
  incremental build. Fixed with `pnpm clean && pnpm build`.
- **Found and fixed a second real bug**: `codepass --version` printed a hardcoded `"0.0.1"` string
  in `cli.ts`, completely disconnected from `package.json`'s actual version. Fixed by reading the
  version from `package.json` at runtime (via `import.meta.url`) so the two can never drift again.
- Verified the name `codepass` was available on npm (404 Not Found at the time).
- Verified: build/lint pass; 57 tests pass; `--help`/`--version` work from a clean build; final
  `npm pack --dry-run` showed 143 files (dist + README + LICENSE + package.json), no stray
  src/test/config-example files, no stale task-mode artifacts.

### T8 — Docs refresh · Sonnet ✅ (last — docs must describe reality)

- `README.md`: added a real install section, removed the two task-mode command examples, replaced
  a stale provider list (which named tools — Aider/Goose/Kiro/Amp — that were never actually in
  the catalog) with a table matching the real 7-tool catalog, added the commercial-break mention,
  removed a dead-directory log reference (see below).
- `CLAUDE.md`: removed the task-mode framing, rewrote the module table for T6's split, removed a
  stale gotcha about "two execution modes," corrected file references.
- `HARNESS_VISION.md`: trimmed the one line that directly contradicted V1 ("keep `codepass run
  \"task\"` for the existing task-based mode") — left as historical context otherwise. (This
  document has since been folded into this file, Part 2.)
- `src/handoff-file.ts`: tightened the instructions the active agent receives — revise the
  working-state sections **in place** rather than appending, keep the whole file under **~150
  lines**. This is the token-minimal handoff strategy PLAN.md asked about: the active agent
  maintains the file as a side effect of normal work; CodePass makes no extra model calls for it.
- **Found and fixed a real dead-code bug**: `.codepass/runs/` and `.codepass/logs/` were still
  being created and reported by `doctor`, but nothing had written to either since T1 deleted task
  mode's log writer. Removed both from the config schema, `doctor`, and the example config.
- Also removed a leftover unused `taskArgs` catalog field (zero consumers since T1).
- **Found and fixed a serious release-risk bug during the final verification pass**: the
  monorepo's Turborepo cache had gone stale and was silently restoring an old `dist/` — bringing
  back the deleted task-mode files and reverting `--version` to `0.0.1` — on every "successful"
  root build. Fixed by clearing the Turborepo cache and forcing a rebuild, then confirming a
  normal build stayed correct afterward. (This class of problem doesn't apply to `codepass` as a
  standalone repo outside the monorepo — see the note in README.md.)
- Verified: build/lint pass; all 57 tests pass; `codepass doctor --all` output cross-checked
  against README's provider table; `npm pack --dry-run` clean.

**Result: V1 shipped.** All of the above is done — build, lint, and 57 tests are green, and the
package is ready for `npm publish` whenever Garrett decides to run it.
