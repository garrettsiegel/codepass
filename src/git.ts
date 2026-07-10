import { execa } from "execa";
import type { GitContext } from "./types.js";

const runGit = async (cwd: string, args: string[]): Promise<string> => {
  try {
    const result = await execa("git", args, {
      cwd,
      reject: false,
      stdout: "pipe",
      stderr: "pipe"
    });

    return result.exitCode === 0 ? result.stdout.trim() : "";
  } catch {
    return "";
  }
};

export const isGitRepo = async (cwd: string): Promise<boolean> => {
  const result = await runGit(cwd, ["rev-parse", "--is-inside-work-tree"]);
  return result === "true";
};

export const getGitRoot = async (cwd: string): Promise<string | undefined> => {
  const root = await runGit(cwd, ["rev-parse", "--show-toplevel"]);
  return root || undefined;
};

export const getChangedFiles = async (cwd: string): Promise<string[]> => {
  const status = await runGit(cwd, ["status", "--short"]);
  if (!status) {
    return [];
  }

  return [
    ...new Set(
      status
        .split("\n")
        .map((line) => line.slice(3).trim())
        .filter(Boolean)
        .map((file) => file.replace(/^"|"$/g, ""))
    )
  ].sort();
};

export const getGitContext = async (
  cwd: string,
  maxDiffChars: number
): Promise<GitContext> => {
  const repo = await isGitRepo(cwd);

  if (!repo) {
    return {
      isGitRepo: false,
      statusShort: "",
      diffStat: "",
      diffNameOnly: "",
      recentDiff: "",
      changedFiles: []
    };
  }

  const [root, statusShort, diffStat, diffNameOnly, rawDiff, changedFiles] =
    await Promise.all([
      getGitRoot(cwd),
      runGit(cwd, ["status", "--short"]),
      runGit(cwd, ["diff", "--stat"]),
      runGit(cwd, ["diff", "--name-only"]),
      runGit(cwd, ["diff", "--", "."]),
      getChangedFiles(cwd)
    ]);

  const recentDiff =
    rawDiff.length > maxDiffChars
      ? `${rawDiff.slice(0, maxDiffChars)}\n\n[Diff truncated at ${maxDiffChars} characters]`
      : rawDiff;

  return {
    isGitRepo: true,
    root,
    statusShort,
    diffStat,
    diffNameOnly,
    recentDiff,
    changedFiles
  };
};

export const getGitSnapshot = async (cwd: string): Promise<GitContext> => {
  const repo = await isGitRepo(cwd);

  if (!repo) {
    return {
      isGitRepo: false,
      statusShort: "",
      diffStat: "",
      diffNameOnly: "",
      recentDiff: "",
      changedFiles: []
    };
  }

  const [root, statusShort, diffStat, diffNameOnly, changedFiles] = await Promise.all([
    getGitRoot(cwd),
    runGit(cwd, ["status", "--short"]),
    runGit(cwd, ["diff", "--stat"]),
    runGit(cwd, ["diff", "--name-only"]),
    getChangedFiles(cwd)
  ]);

  return {
    isGitRepo: true,
    root,
    statusShort,
    diffStat,
    diffNameOnly,
    recentDiff: "",
    changedFiles
  };
};

export const formatGitContext = (context: GitContext): string => {
  if (!context.isGitRepo) {
    return "No git repository detected.";
  }

  return [
    `Git root: ${context.root ?? "unknown"}`,
    "",
    "git status --short:",
    context.statusShort || "(clean)",
    "",
    "git diff --stat:",
    context.diffStat || "(no unstaged diff)",
    "",
    "git diff --name-only:",
    context.diffNameOnly || "(no changed tracked files)",
    "",
    "Recent diff:",
    context.recentDiff || "(no diff)"
  ].join("\n");
};

// Lean snapshot for the handoff file: no raw diff. The next agent works in the
// same repo and can run `git diff` itself; the handoff carries narrative, not
// transcripts of the diff.
export const formatGitSnapshot = (context: GitContext): string => {
  if (!context.isGitRepo) {
    return "No git repository detected.";
  }

  return [
    `Git root: ${context.root ?? "unknown"}`,
    "",
    `Changed entries: ${context.changedFiles.length}`,
    "",
    "git diff --stat (capped):",
    formatCappedLines(context.diffStat, 20, "diff-stat lines") || "(no unstaged diff)"
  ].join("\n");
};

const formatCappedLines = (value: string, limit: number, label: string): string => {
  const lines = value.split("\n").filter(Boolean);
  if (lines.length <= limit) {
    return lines.join("\n");
  }
  return [...lines.slice(0, limit), `[${lines.length - limit} more ${label}; inspect the repository directly]`]
    .join("\n");
};

export const formatChangedFiles = (files: string[], limit = 50): string => {
  const visible = files.slice(0, limit).map((file) => `- ${file}`);
  if (files.length > limit) {
    visible.push(`- [${files.length - limit} more changed files; run git status --short]`);
  }
  return visible.length > 0 ? visible.join("\n") : "- None.";
};
