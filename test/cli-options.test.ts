import { afterEach, describe, expect, it } from "vitest";
import {
  EXPLICIT_TASK_SENTINEL,
  readOptionFromArgv,
  splitExplicitTaskArgv
} from "../src/cli-options.js";

const originalArgv = [...process.argv];

afterEach(() => {
  process.argv = [...originalArgv];
});

describe("CLI option recovery", () => {
  it("reads root options before a subcommand", () => {
    process.argv = ["node", "kim", "--cwd", "/tmp/project", "doctor"];

    expect(readOptionFromArgv(["--cwd"])).toBe("/tmp/project");
  });

  it("does not reinterpret task text after -- as CLI options", () => {
    process.argv = ["node", "kim", "--", "review", "--cwd", "/untrusted"];

    expect(readOptionFromArgv(["--cwd"])).toBeUndefined();
  });

  it("protects an explicit task that has the same name as a subcommand", () => {
    expect(splitExplicitTaskArgv([
      "node",
      "kim",
      "--cwd",
      "/tmp/project",
      "--",
      "init"
    ])).toEqual({
      argv: ["node", "kim", "--cwd", "/tmp/project", EXPLICIT_TASK_SENTINEL],
      task: "init"
    });
  });
});
