# CodePass demo recording

`public/codepass-demo.gif` — the README hero — is recorded with
[VHS](https://github.com/charmbracelet/vhs).

The recording drives the **real** `codepass` harness: provider launch, live limit
detection, the "commercial break" interstitial, and the handoff-driven relaunch all
execute for real. Only the two "agents" are simulated — `agent.sh` is a small stub
that prints believable Claude Code / Codex output, so the demo needs no live tools,
API keys, or a real rate limit. Provider **labels** ("Claude Code", "Codex") are
cosmetic; the internal names (`demo-a` / `demo-b`) deliberately avoid the built-in
catalog so they aren't overridden (see `mergeCatalogInteractiveProviders`).

## Re-record

```sh
brew install vhs                 # one-time — VHS is a Go binary, not an npm dep
pnpm --filter codepass build     # refresh dist/cli.js
vhs demo/demo.tape               # writes public/codepass-demo.gif
```

Run from the repo root. The tape sets up a throwaway `/tmp/codepass-demo` working
directory (so on-screen paths stay neutral) and defines a `codepass` shell shim
pointing at the freshly built `dist/cli.js`, then records the session.

## Files

- `demo.tape` — the VHS script (dimensions, theme, timing, keystrokes).
- `codepass.config.json` — demo config: two stub providers, updates off,
  `setupComplete: true`.
- `agent.sh` — the simulated agent output for both roles (`claude`, `codex`).

## Recording a version with the real tools

Swap the two providers in `codepass.config.json` for the catalog `claude` / `codex`
entries and drive a manual `Ctrl+]` switch from the tape instead of the scripted
limit line. That's non-deterministic and needs both tools installed and
authenticated, which is why the committed demo uses stubs.
