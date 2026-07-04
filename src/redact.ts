// Best-effort secret redaction for persisted artifacts (handoff files, session
// logs). Terminal transcripts and git diffs frequently echo credentials; this
// scrubs the well-known token shapes before CodePass writes them to disk. It is
// defense-in-depth, not a guarantee — novel or truncated secrets can slip
// through, so artifacts are still treated as sensitive (and gitignored).

interface RedactionRule {
  kind: string;
  pattern: RegExp;
}

// Ordered most-specific first so a token isn't partially matched by a broader
// rule. Each pattern is anchored to token-shaped boundaries to limit false
// positives on ordinary prose.
const RULES: RedactionRule[] = [
  { kind: "anthropic-key", pattern: /\bsk-ant-[A-Za-z0-9_-]{16,}/g },
  { kind: "openai-key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/g },
  { kind: "github-token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/g },
  { kind: "github-pat", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}/g },
  { kind: "aws-access-key", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { kind: "slack-token", pattern: /\bxox[bpars]-[A-Za-z0-9-]{10,}/g },
  { kind: "google-key", pattern: /\bAIza[A-Za-z0-9_-]{35}\b/g },
  { kind: "bearer-token", pattern: /\bBearer\s+[A-Za-z0-9._-]{12,}/g },
  {
    kind: "private-key",
    pattern: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z ]+ )?PRIVATE KEY-----/g
  }
];

/**
 * Replaces recognizable secrets in `text` with `[REDACTED:<kind>]`. Pure and
 * idempotent (a `[REDACTED:*]` marker contains no secret shapes, so re-running is
 * a no-op).
 */
export const redactSecrets = (text: string): string =>
  RULES.reduce(
    (accumulated, rule) => accumulated.replace(rule.pattern, `[REDACTED:${rule.kind}]`),
    text
  );
