# CodePass demo — records a real handoff between two (simulated) coding agents.
# Prereq: `brew install vhs`.  Run from the repo root:  vhs demo/demo.tape
# Renders public/codepass-demo.gif.

Output public/codepass-demo.gif

Require bash

Set Shell bash
Set FontSize 16
Set Width 1180
Set Height 720
Set Padding 26
Set Margin 14
Set BorderRadius 10
Set WindowBar Colorful
Set Theme "Dracula"
Set TypingSpeed 70ms
Set Framerate 22

# --- Setup (hidden): a clean, neutral working dir and a `codepass` shim so the
#     recorded prompt shows a bare `codepass` and on-screen paths stay neutral. ---
Hide
Type `export PS1='$ '` Enter
Type `CLI="$PWD/dist/cli.js"` Enter
Type `codepass() { node "$CLI" "$@"; }` Enter
Type `D=/tmp/codepass-demo; rm -rf "$D"; mkdir -p "$D"` Enter
Type `cp demo/agent.sh "$D/agent.sh"; chmod +x "$D/agent.sh"` Enter
Type `cp demo/codepass.config.json "$D/codepass.config.json"` Enter
Type `cd "$D"` Enter
Type `clear` Enter
Show

# --- Recorded session ---
Sleep 700ms
Type "codepass"
Sleep 600ms
Enter

# "Start with this chain?" — accept the default (Yes, launch).
Sleep 2200ms
Enter

# Harness starts, the first agent works and hits its usage limit, CodePass shows
# the commercial break, and the second agent reads the handoff and continues.
Sleep 15s

# Final hold on the "continuing" frame.
Sleep 1200ms
