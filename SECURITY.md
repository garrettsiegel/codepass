# Security Policy

## Supported versions

keepitmovin is pre-1.0-style rapid development; only the latest published version on npm receives
security fixes. Please upgrade before reporting.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately** — do not open a public issue.

- Preferred: open a private advisory via GitHub → the repository's **Security** tab →
  **Report a vulnerability**.
- Or email **garrett@garrettsiegel.com** with "keepitmovin security" in the subject.

Include the version (`kim --version`), your OS, reproduction steps, and the impact you
observed. You'll get an acknowledgement within a few days. Please give a reasonable window to ship
a fix before any public disclosure.

## Handling sensitive data

keepitmovin writes handoff files and session logs under `.keepitmovin/`, which can capture task text,
terminal output, and repository metadata — and therefore may contain secrets. keepitmovin writes a
`.keepitmovin/.gitignore` so these stay out of your repo and best-effort redacts common credential
formats before persisting, but treat these files as sensitive and don't share them blindly.

A tool's task prompt passed as a command-line argument can be briefly visible to other local
processes via the OS process list. Don't put credentials in task text.
