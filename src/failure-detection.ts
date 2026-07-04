import { classifyError, matchLimitPattern, matchProviderLimitPattern } from "./errors.js";
import type { AgentErrorType, InteractiveProviderConfig, CodePassConfig } from "./types.js";

// Control sequences for the supported manual-switch keys. Values are the raw
// bytes a terminal emits for each chord.
const MANUAL_SWITCH_SEQUENCES: Record<string, string> = {
  "ctrl-]": "\x1d",
  "ctrl-\\": "\x1c",
  "ctrl-g": "\x07",
  "ctrl-o": "\x0f"
};

export const getManualSwitchSequence = (config: CodePassConfig): string =>
  MANUAL_SWITCH_SEQUENCES[config.harness.manualSwitchKey.toLowerCase()] ?? "\x1d";

// Prefixes that mark a line as a tool/status/error line rather than the agent's
// prose. A limit pattern is only trusted live when it heads its line or the line
// starts with one of these.
const ERROR_LINE_INDICATORS = [
  "error",
  "err:",
  "fatal",
  "failed",
  "request failed",
  "api error",
  "http error",
  "status:",
  "warn:",
  "warning:",
  "✗",
  "×",
  "⚠",
  "⛔",
  "🚫",
  "❌",
  "⏳",
  "❗",
  "‼",
  "[error]",
  "[warn]",
  "[warning]"
];

// Words that signal a definitive status event (not prose discussion) when they
// appear in the same line as a limit pattern. Handles tool-generated messages
// like "Claude usage limit reached." that lack a technical error prefix.
const STATUS_WORDS = [
  "reached",
  "exceeded",
  "exceed",
  "encountered",
  "triggered",
  "detected",
  "hit"
];

const stripIgnored = (text: string, ignore: Array<string | undefined>): string =>
  ignore
    .filter((value): value is string => Boolean(value))
    .reduce((accumulated, value) => accumulated.replaceAll(value, ""), text);

// True when `line` contains `pattern` in a way that reads like a status/error
// line — either the line leads with the pattern itself, or with a known error
// indicator. This is what stops CodePass from switching when an agent merely
// *mentions* a rate limit in ordinary prose.
//
// `strict` omits the loose "line contains a status word anywhere" branch. Use it
// for provider `limitPatterns` (exact tool banners): a real banner heads its own
// line, so requiring that avoids switching on an agent's prose that merely quotes
// the banner alongside a word like "reached" or "hit".
const isStatusLikeLine = (
  line: string,
  pattern: string,
  options: { strict?: boolean } = {}
): boolean => {
  const trimmed = line.trim().toLowerCase();

  if (!trimmed.includes(pattern)) {
    return false;
  }

  if (trimmed.startsWith(pattern)) {
    return true;
  }

  if (ERROR_LINE_INDICATORS.some((indicator) => trimmed.startsWith(indicator))) {
    return true;
  }

  const withoutPrefix = trimmed.replace(/^[[(][^\])]*[\])]\s*/, "");
  if (withoutPrefix !== trimmed) {
    if (
      withoutPrefix.startsWith(pattern) ||
      ERROR_LINE_INDICATORS.some((indicator) => withoutPrefix.startsWith(indicator))
    ) {
      return true;
    }
  }

  // A line with a limit pattern AND a status word (e.g. "usage limit reached")
  // is a definitive status event, not prose discussion. Skipped in strict mode.
  if (!options.strict && STATUS_WORDS.some((word) => trimmed.includes(word))) {
    return true;
  }

  return false;
};

// Live (still-running) detection. Scoped to the transcript tail with the prompts
// stripped. Both the generic patterns and a provider's curated `limitPatterns`
// (exact tool banners) must appear on a status-like line — the banner path uses
// the stricter guard, so an agent merely quoting a banner in prose won't switch.
export const detectLiveFailure = (
  tail: string,
  provider: InteractiveProviderConfig,
  config: CodePassConfig,
  ignore: Array<string | undefined>
): AgentErrorType | undefined => {
  const cleaned = stripIgnored(tail, ignore);
  const fallbackOn = provider.fallbackOn ?? config.fallbackOn;

  for (const line of cleaned.split("\n")) {
    const banner = matchProviderLimitPattern(line, provider.limitPatterns);
    if (
      fallbackOn.includes("rate_limit") &&
      banner &&
      isStatusLikeLine(line, banner.toLowerCase(), { strict: true })
    ) {
      return "rate_limit";
    }

    const match = matchLimitPattern(line);
    if (!match || !fallbackOn.includes(match.type)) {
      continue;
    }

    if (isStatusLikeLine(line, match.pattern)) {
      return match.type;
    }
  }

  return undefined;
};

// Post-exit detection. A non-zero exit is already a strong failure signal, so
// this uses the broader classifier on the stripped tail.
export const detectExitFailure = (
  tail: string,
  provider: InteractiveProviderConfig,
  config: CodePassConfig,
  exitCode: number | null,
  ignore: Array<string | undefined>
): AgentErrorType | undefined => {
  const detected = classifyError(stripIgnored(tail, ignore), "", exitCode ?? 1);
  const fallbackOn = provider.fallbackOn ?? config.fallbackOn;

  return detected && fallbackOn.includes(detected) ? detected : undefined;
};
