# keepitmovin demo recording

`public/kim-demo.gif` — the README hero — is recorded with
[VHS](https://github.com/charmbracelet/vhs).

The recording drives the **real** `kim` harness: provider launch, live limit
detection, the "commercial break" interstitial, and the handoff-driven relaunch all
execute for real. Only the two "agents" are simulated — `agent.sh` is a small stub
that prints believable Claude Code / Codex output, so the demo needs no live tools,
API keys, or a real rate limit. Provider **labels** ("Claude Code", "Codex") are
cosmetic; the internal names (`demo-a` / `demo-b`) deliberately avoid the built-in
catalog so they aren't overridden (see `mergeCatalogInteractiveProviders`).

## Re-record

```sh
brew install vhs                 # one-time — VHS is a Go binary, not an npm dep
pnpm --filter keepitmovin build     # refresh dist/cli.js
vhs demo/demo.tape               # writes public/kim-demo.gif
```

Run from the repo root. The tape sets up a throwaway `/tmp/kim-demo` working
directory (so on-screen paths stay neutral) and defines a `kim` shell shim
pointing at the freshly built `dist/cli.js`, then records the session.

## Files

- `demo.tape` — the VHS script (dimensions, theme, timing, keystrokes).
- `keepitmovin.config.json` — demo config: two stub providers, updates off,
  `setupComplete: true`.
- `agent.sh` — the simulated agent output for both roles (`claude`, `codex`).

## Recording a version with the real tools

Swap the two providers in `keepitmovin.config.json` for the catalog `claude` / `codex`
entries and drive a manual `Ctrl+]` switch from the tape instead of the scripted
limit line. That's non-deterministic and needs both tools installed and
authenticated, which is why the committed demo uses stubs.

For the launch recording, `real-demo.tape` and `real-keepitmovin.config.json`
run an authenticated Claude Code → Codex session in
`/private/tmp/keepitmovin-real-demo`, trigger the visible manual switch, and
write `marketing/product-hunt-demo.mp4`. The task is intentionally tiny and the
tape disables usage probes and watchdog warnings so the recording demonstrates
the handoff itself rather than manufacturing a limit event. The launch video
uses `product-hunt-narration.txt` as its short voice-over script.

After recording, render and mux the timed macOS voice-over:

```sh
say -r 175 -o /private/tmp/keepitmovin-product-hunt.aiff -f demo/product-hunt-narration.txt
ffmpeg -y -i marketing/product-hunt-demo.mp4 \
  -i /private/tmp/keepitmovin-product-hunt.aiff \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k -af apad -shortest \
  /private/tmp/product-hunt-demo-with-audio.mp4
mv /private/tmp/product-hunt-demo-with-audio.mp4 marketing/product-hunt-demo.mp4
```
