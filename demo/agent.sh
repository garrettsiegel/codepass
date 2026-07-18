#!/usr/bin/env bash
# keepitmovin demo stub — simulates a coding agent's terminal output so the README
# GIF can show a *real* handoff without needing live tools or real rate limits.
# The keepitmovin harness around this (launch, limit detection, commercial break,
# handoff-driven relaunch) all runs for real; only this output is simulated.
set -u

role="${1:-claude}"

# Print a line, then pause so the recording plays at a readable pace.
line() { printf '%s\n' "$1"; sleep "${2:-0.6}"; }

if [ "$role" = "claude" ]; then
  line "● Analyzing repository structure…" 0.6
  line "● Refactoring auth module  src/auth/session.ts" 0.8
  line "  ✓ Extracted token-refresh helper" 0.5
  line "● Running tests…" 0.7
  line "  ✓ 24 passed" 0.6
  line "● Updating docs…" 0.8
  printf '\n'
  sleep 0.3
  # This exact line is demo-a's `limitPatterns` entry — keepitmovin detects it live
  # and pauses this tool, then hands off to the next provider.
  line "Claude usage limit reached · resets in 4h 12m" 1.0
  # Stay alive briefly; keepitmovin kills us the moment it sees the banner above.
  sleep 3
else
  line "> Reading .keepitmovin/current/handoff.md" 0.8
  line "  Picking up where Claude Code left off…" 0.9
  line "● Continuing: finish auth module refactor" 0.8
  line "  ✓ Wired refreshed token into the request client" 0.7
  line "● Running tests…" 0.7
  line "  ✓ 24 passed" 0.8
  line "● Ready to keep going." 0.5
  # Hold on this frame so the recording ends here, before session housekeeping.
  sleep 8
fi
