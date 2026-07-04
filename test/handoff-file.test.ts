import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config.js";
import {
  appendHandoffCheckpoint,
  archiveHandoffFile,
  buildProviderHandoffPrompt,
  buildSessionPrompt,
  clearHandoffArtifacts,
  createHandoffFile,
  getHandoffPaths,
  summarizeHandoffFile
} from "../src/handoff-file.js";

const makeTempDir = async (): Promise<string> => {
  const dir = path.join(os.tmpdir(), `codepass-handoff-file-${Date.now()}-${Math.random()}`);
  await mkdir(dir, { recursive: true });
  return dir;
};

describe("handoff file helpers", () => {
  it("creates, appends, summarizes, archives, and clears handoff files", async () => {
    const cwd = await makeTempDir();
    const config = defaultConfig();
    const providers = config.harness.providers.filter((provider) => provider.name !== "cline");
    const livePath = await createHandoffFile(cwd, config, providers, "2026-07-03T17:00:00.000Z");

    expect(livePath).toBe(getHandoffPaths(cwd, config).livePath);
    await appendHandoffCheckpoint(cwd, config, {
      type: "tool_switch",
      fromProvider: "Claude Code",
      toProvider: "Codex",
      reason: "rate_limit",
      transcriptExcerpt: "rate limit reached"
    });

    const content = await readFile(livePath, "utf8");
    expect(content).toContain("CodePass Handoff");
    expect(content).toContain("Reason: rate_limit");
    expect(content).toContain("rate limit reached");

    const summary = await summarizeHandoffFile(cwd, config);
    expect(summary.exists).toBe(true);
    expect(summary.summary).toContain("CodePass Handoff");

    const archivePath = await archiveHandoffFile(cwd, config, "session-1");
    expect(archivePath).toBeDefined();
    await expect(stat(archivePath ?? "")).resolves.toBeDefined();

    await mkdir(path.join(cwd, ".codepass", "sessions"), { recursive: true });
    await writeFile(path.join(cwd, ".codepass", "sessions", "fake.json"), "{}", "utf8");
    const removed = await clearHandoffArtifacts(cwd, config);
    expect(removed.length).toBeGreaterThan(0);
    await expect(stat(livePath)).rejects.toThrow();
  });

  it("removes only the handoff file when handoffPath resolves to the cwd", async () => {
    const cwd = await makeTempDir();
    const config = defaultConfig();
    // A natural-looking but dangerous value: dirname resolves to the cwd itself.
    config.harness.handoffPath = "handoff.md";
    const livePath = getHandoffPaths(cwd, config).livePath;
    await writeFile(livePath, "# handoff", "utf8");
    // A user file that must survive a clear.
    const userFile = path.join(cwd, "important.txt");
    await writeFile(userFile, "keep me", "utf8");

    const removed = await clearHandoffArtifacts(cwd, config);

    // The cwd (and the user's file) must still exist; only the handoff file goes.
    await expect(stat(userFile)).resolves.toBeDefined();
    await expect(stat(cwd)).resolves.toBeDefined();
    await expect(stat(livePath)).rejects.toThrow();
    expect(removed).toContain(cwd);
  });

  it("refuses to recursively delete an absolute sessions dir pointing at home", async () => {
    const cwd = await makeTempDir();
    const config = defaultConfig();
    config.logs.sessionsDir = os.homedir();
    const marker = path.join(os.homedir(), `.codepass-guard-marker-${Date.now()}-${Math.random()}`);
    await writeFile(marker, "keep", "utf8");

    try {
      await clearHandoffArtifacts(cwd, config);
      // Home directory and its contents must be untouched.
      await expect(stat(os.homedir())).resolves.toBeDefined();
      await expect(stat(marker)).resolves.toBeDefined();
    } finally {
      await unlink(marker).catch(() => {});
    }
  });

  it("builds session and provider handoff prompts with the handoff path", () => {
    const config = defaultConfig();
    const providers = config.harness.providers.filter((provider) => provider.name !== "cline");
    const sessionPrompt = buildSessionPrompt("/repo/.codepass/current/handoff.md", providers);
    const providerPrompt = buildProviderHandoffPrompt(
      "/repo/.codepass/current/handoff.md",
      "Claude Code",
      "Codex",
      "rate_limit"
    );

    expect(sessionPrompt).toContain("Keep this shared handoff file updated");
    expect(sessionPrompt).toContain("/repo/.codepass/current/handoff.md");
    expect(providerPrompt).toContain("Read this handoff file first");
    expect(providerPrompt).toContain("Switch reason: rate_limit");
  });
});
