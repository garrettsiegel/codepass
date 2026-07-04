import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { ensureArtifactsIgnored } from "./artifacts.js";
import { agentErrorTypeSchema, DEFAULT_CODEPASS_DIR } from "./config.js";
import { redactSecrets } from "./redact.js";
import { resolveFromCwd } from "./paths.js";
import type { HarnessSessionLog, CodePassConfig } from "./types.js";

const harnessAttemptLogSchema = z.object({
  provider: z.string(),
  label: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  startedAt: z.string(),
  endedAt: z.string(),
  exitCode: z.number().nullable(),
  errorType: agentErrorTypeSchema.optional(),
  transcriptExcerpt: z.string()
});

// Mirrors the HarnessSessionLog type. Session logs are read back from disk (where
// they can be corrupted or hand-edited), so validate rather than trust the shape.
const harnessSessionLogSchema = z.object({
  cwd: z.string(),
  startedAt: z.string(),
  endedAt: z.string(),
  providerOrder: z.array(z.string()),
  attempts: z.array(harnessAttemptLogSchema),
  finalProvider: z.string().optional(),
  success: z.boolean(),
  changedFiles: z.array(z.string()),
  sessionLogPath: z.string().optional()
});

const safeTimestamp = (date: Date): string =>
  date.toISOString().replaceAll(":", "-").replaceAll(".", "-");

export const resolveSessionsDir = (cwd: string, config: CodePassConfig): string =>
  resolveFromCwd(cwd, config.logs.sessionsDir);

export const writeSessionLog = async (
  cwd: string,
  config: CodePassConfig,
  log: HarnessSessionLog
): Promise<string> => {
  const sessionsDir = resolveSessionsDir(cwd, config);
  await mkdir(sessionsDir, { recursive: true });
  await ensureArtifactsIgnored(path.join(cwd, DEFAULT_CODEPASS_DIR));

  const logPath = path.join(sessionsDir, `${safeTimestamp(new Date(log.startedAt))}.json`);
  const redactedLog: HarnessSessionLog = {
    ...log,
    attempts: log.attempts.map((attempt) => ({
      ...attempt,
      transcriptExcerpt: redactSecrets(attempt.transcriptExcerpt)
    }))
  };
  await writeFile(
    logPath,
    `${JSON.stringify({ ...redactedLog, sessionLogPath: logPath }, null, 2)}\n`,
    "utf8"
  );
  return logPath;
};

export const readLatestSessionLog = async (
  cwd: string,
  config: CodePassConfig
): Promise<HarnessSessionLog | undefined> => {
  const sessionsDir = resolveSessionsDir(cwd, config);

  try {
    const entries = (await readdir(sessionsDir))
      .filter((entry) => entry.endsWith(".json"))
      .sort();
    const latest = entries.at(-1);
    if (!latest) {
      return undefined;
    }

    const raw = await readFile(path.join(sessionsDir, latest), "utf8");
    const parsed = harnessSessionLogSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
};
