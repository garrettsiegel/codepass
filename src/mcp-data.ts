import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "./config.js";
import { redactSecrets } from "./redact.js";
import { readRecentSessionLogs } from "./session-log.js";

export interface McpSessionSummary {
  startedAt: string;
  endedAt: string;
  tools: string[];
  finalProvider?: string;
  success: boolean;
  outcome?: string;
  changedFiles: number;
  handoffReceipts: { received: number; expected: number };
  compactionsRecovered: number;
}

const containedPath = (root: string, candidate: string): string => {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(root, candidate);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("keepitmovin config points outside the active MCP project root");
  }
  return resolved;
};

export const readMcpHandoff = async (projectRoot: string): Promise<string> => {
  const { config } = await loadConfig(projectRoot);
  const handoffPath = containedPath(projectRoot, config.harness.handoffPath);
  try {
    return redactSecrets(await readFile(handoffPath, "utf8"));
  } catch {
    return "No keepitmovin handoff exists for this project yet.";
  }
};

export const readMcpSessionSummaries = async (
  projectRoot: string,
  limit = 10
): Promise<McpSessionSummary[]> => {
  const { config } = await loadConfig(projectRoot);
  containedPath(projectRoot, config.logs.sessionsDir);
  const logs = await readRecentSessionLogs(projectRoot, config, Math.min(10, Math.max(0, limit)));
  return logs.map((log) => {
    const expected = log.attempts.filter(
      (attempt) => attempt.handoffReceipt?.status !== "not_applicable"
    );
    return {
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      tools: log.attempts.map((attempt) => attempt.provider),
      ...(log.finalProvider ? { finalProvider: log.finalProvider } : {}),
      success: log.success,
      ...(log.outcome ? { outcome: log.outcome } : {}),
      changedFiles: log.changedFiles.length,
      handoffReceipts: {
        received: expected.filter((attempt) => attempt.handoffReceipt?.status === "received").length,
        expected: expected.length
      },
      compactionsRecovered: log.attempts.reduce(
        (count, attempt) => count + (attempt.compactionEvents?.length ?? 0),
        0
      )
    };
  });
};
