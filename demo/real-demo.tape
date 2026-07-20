# Real Claude Code -> Codex handoff for the Product Hunt launch.
# Both tools must already be installed and authenticated.

Output marketing/product-hunt-demo.mp4

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
Set TypingSpeed 45ms

Hide
Type `export PS1='$ '` Enter
Type `REPO="$PWD"` Enter
Type `CLI="$REPO/dist/cli.js"` Enter
Type `kim() { node "$CLI" "$@"; }` Enter
Type `D=/private/tmp/keepitmovin-real-demo; rm -rf /private/tmp/keepitmovin-real-demo; mkdir -p /private/tmp/keepitmovin-real-demo` Enter
Type `cp "$REPO/demo/real-keepitmovin.config.json" "$D/keepitmovin.config.json"` Enter
Type `printf '# Demo task\n\n1. Claude creates started.txt, then waits.\n2. After the manual handoff, Codex creates continued.txt and reports both files.\n' > "$D/TASK.md"` Enter
Type `cd "$D"` Enter
Type `git init -q` Enter
Type `clear` Enter
Show

Sleep 700ms
Type "kim --no-route 'Read TASK.md. Complete only the step assigned to your current tool, keep the handoff current, then wait.'"
Enter
Sleep 2s
Enter

# Claude asks once whether the disposable demo repo is trusted.
Sleep 4s
Enter

# Claude runs in accept-edits mode for this disposable demo. Let it create the
# first file and refresh the handoff, then switch manually.
Sleep 10s
Enter
Sleep 8s
Ctrl+]

# Choose Codex in the manual-switch menu.
Sleep 2s
Enter

# Trust the disposable repo, then let Codex create the second file.
Sleep 5s
Enter
Sleep 24s
Ctrl+C
Sleep 2s
