import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatChangedFiles,
  formatGitSnapshot,
  getChangedFiles,
  getGitContext,
  isGitRepo
} from "../src/git.js";

const makeTempDir = async (): Promise<string> => {
  const dir = path.join(os.tmpdir(), `kim-git-${Date.now()}-${Math.random()}`);
  await mkdir(dir, { recursive: true });
  return dir;
};

describe("git helpers", () => {
  it("degrades cleanly outside a git repository", async () => {
    const cwd = await makeTempDir();

    await expect(isGitRepo(cwd)).resolves.toBe(false);
    await expect(getChangedFiles(cwd)).resolves.toEqual([]);
    await expect(getGitContext(cwd, 1_000)).resolves.toMatchObject({
      isGitRepo: false,
      changedFiles: []
    });
  });

  it("caps mechanical handoff lists and avoids duplicate status/name dumps", () => {
    const files = Array.from({ length: 55 }, (_, index) => `src/file-${index}.ts`);
    const snapshot = formatGitSnapshot({
      isGitRepo: true,
      root: "/repo",
      statusShort: files.map((file) => ` M ${file}`).join("\n"),
      diffStat: Array.from({ length: 25 }, (_, index) => ` src/file-${index}.ts | 1 +`).join("\n"),
      diffNameOnly: files.join("\n"),
      recentDiff: "",
      changedFiles: files
    });

    expect(formatChangedFiles(files).split("\n")).toHaveLength(51);
    expect(formatChangedFiles(files)).toContain("5 more changed files");
    expect(snapshot).toContain("Changed entries: 55");
    expect(snapshot).toContain("5 more diff-stat lines");
    expect(snapshot).not.toContain("git status --short");
    expect(snapshot).not.toContain("git diff --name-only");
  });
});
