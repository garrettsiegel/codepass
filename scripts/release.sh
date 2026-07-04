#!/usr/bin/env bash
# Release codepass: bump the version, commit + tag, push to origin, and publish
# to npm — in one step.
#
# Usage:
#   pnpm release <patch|minor|major|<semver>> [--dry-run] [--yes]
#
#   --dry-run   Run build/test/lint and `npm publish --dry-run` to preview the
#               package contents. Makes no git commits/tags/pushes and does not
#               publish for real.
#   --yes, -y   Skip the interactive confirmation prompt (for CI/non-interactive use).
#
# Requires: a clean working tree on `main`, in sync with origin/main, and an
# active `npm login` session. Refuses to run otherwise.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

BUMP=""
DRY_RUN=false
ASSUME_YES=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --yes|-y) ASSUME_YES=true ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
    *) BUMP="$arg" ;;
  esac
done

if [[ -z "$BUMP" ]]; then
  echo "Usage: pnpm release <patch|minor|major|<semver>> [--dry-run] [--yes]" >&2
  exit 1
fi

PNPM="pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  PNPM="$HOME/Library/pnpm/pnpm"
fi

echo "==> Checking branch and working tree"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Refusing to release from branch '$CURRENT_BRANCH' (expected 'main')." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash your changes before releasing:" >&2
  git status --short >&2
  exit 1
fi

if [[ "$DRY_RUN" != true ]]; then
  echo "==> Checking origin/main is in sync"
  git fetch origin main
  LOCAL_SHA="$(git rev-parse HEAD)"
  REMOTE_SHA="$(git rev-parse origin/main)"
  if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
    echo "Local main is not in sync with origin/main. Pull/rebase first." >&2
    exit 1
  fi

  echo "==> Checking npm auth"
  NPM_USER="$(npm whoami 2>/dev/null || true)"
  if [[ -z "$NPM_USER" ]]; then
    echo "Not logged in to npm. Run 'npm login' first." >&2
    exit 1
  fi
  echo "npm user: $NPM_USER"
fi

echo "==> Build"
"$PNPM" build
echo "==> Test"
"$PNPM" test
echo "==> Lint"
"$PNPM" lint

CURRENT_VERSION="$(node -p "require('./package.json').version")"
NEXT_VERSION="$(node -e '
  const bump = process.argv[1];
  const [major, minor, patch] = require("./package.json").version.split(".").map(Number);
  if (bump === "major") console.log([major + 1, 0, 0].join("."));
  else if (bump === "minor") console.log([major, minor + 1, 0].join("."));
  else if (bump === "patch") console.log([major, minor, patch + 1].join("."));
  else console.log(bump.replace(/^v/, ""));
' "$BUMP")"

if [[ "$DRY_RUN" == true ]]; then
  echo "==> [dry-run] Would bump $CURRENT_VERSION -> $NEXT_VERSION, commit, tag, push, and publish."
  echo "==> [dry-run] Previewing npm package contents (no git/npm mutation)"
  npm publish --dry-run
  echo "==> [dry-run] Done. Re-run without --dry-run to actually release."
  exit 0
fi

echo ""
echo "This will:"
echo "  1. Bump version $CURRENT_VERSION -> $NEXT_VERSION"
echo "  2. Commit and tag v$NEXT_VERSION"
echo "  3. Push main + tags to origin"
echo "  4. Publish $NEXT_VERSION to npm"
echo ""

if [[ "$ASSUME_YES" != true ]]; then
  read -r -p "Proceed? [y/N] " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted. No changes made."
    exit 1
  fi
fi

echo "==> Bumping version, committing, and tagging"
npm version "$BUMP" -m "release: v%s"

echo "==> Pushing to origin"
git push origin main --follow-tags

echo "==> Publishing to npm"
npm publish

echo "==> Released v$NEXT_VERSION"
