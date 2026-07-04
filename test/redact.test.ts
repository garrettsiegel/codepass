import { describe, expect, it } from "vitest";
import { redactSecrets } from "../src/redact.js";

describe("redactSecrets", () => {
  const positives: Array<[string, string, string]> = [
    ["anthropic-key", "sk-ant-api03-AbCdEf0123456789ghIJKlMnOp", "anthropic-key"],
    ["openai-key", "sk-proj-AbCdEf0123456789ghIJKlMnOpqrST", "openai-key"],
    ["github-token", "ghp_AbCdEf0123456789ghIJKlMnOpqrStUv12", "github-token"],
    ["github-pat", "github_pat_11ABCDEF0123456789_abcdefghij", "github-pat"],
    ["aws-access-key", "AKIAIOSFODNN7EXAMPLE", "aws-access-key"],
    ["slack-token", "xoxb-123456789012-abcdefABCDEF", "slack-token"],
    ["bearer-token", "Bearer abcdef0123456789ABCDEF", "bearer-token"]
  ];

  it.each(positives)("redacts a %s", (_label, secret, kind) => {
    const out = redactSecrets(`token=${secret} end`);
    expect(out).toContain(`[REDACTED:${kind}]`);
    expect(out).not.toContain(secret);
    expect(out).toContain("token=");
    expect(out).toContain("end");
  });

  it("redacts a PEM private key block", () => {
    const pem = [
      "-----BEGIN RSA PRIVATE KEY-----",
      "MIIEowIBAAKCAQEA0Z...fakekeymaterial...",
      "-----END RSA PRIVATE KEY-----"
    ].join("\n");
    const out = redactSecrets(`before\n${pem}\nafter`);
    expect(out).toContain("[REDACTED:private-key]");
    expect(out).not.toContain("fakekeymaterial");
    expect(out).toContain("before");
    expect(out).toContain("after");
  });

  it("leaves lookalike words untouched (no false positives)", () => {
    const benign = "The skew was ghpage-worthy; a task reached AKIA status. Bearer of good news.";
    expect(redactSecrets(benign)).toBe(benign);
  });

  it("is idempotent", () => {
    const once = redactSecrets("key sk-ant-api03-AbCdEf0123456789ghIJKlMnOp done");
    expect(redactSecrets(once)).toBe(once);
  });
});
