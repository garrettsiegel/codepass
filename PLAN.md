# CodePass Task Routing And Handoff Reliability

Status: complete.

## Decisions

- CodePass becomes the sole maintained home for model routing; `utility-projects/model-router` is removed after migration.
- Routing is opt-in, deterministic, local-only, and runs before provider launch.
- The configured provider order remains authoritative; routing selects model and reasoning effort within that order.
- GPT-5.6 Sol/Terra/Luna are preferred only when discovered in the local Codex model cache.
- Automatic routing never selects `ultra`; users may request it explicitly when supported.
- Routing-enabled interactive sessions ask once for a Completed / Partial / Failed / Abandoned outcome.

## Tasks

- [x] T1: Secure handoff cleanup and restore a green baseline.
- [x] T2: Reliably deliver initial tasks and handoff prompts to providers.
- [x] T3: Harden handoff refresh, archival, final excerpts, and quality measurement.
- [x] T4: Add deterministic task routing and Codex model discovery.
- [x] T5: Integrate routing, overrides, setup opt-in, outcomes, and session telemetry.
- [x] T6: Update documentation and remove the standalone model-router project.
- [x] T7: Run adversarial review, live acceptance checks, and final verification.

## Model Assignments

| Task | Model | Reasoning |
|---|---|---|
| T1 | GPT-5.6 Sol | high |
| T2 | GPT-5.6 Terra | high |
| T3 | GPT-5.6 Terra | high |
| T4 | GPT-5.6 Terra | high |
| T5 | GPT-5.6 Terra | medium |
| T6 | GPT-5.6 Luna | medium |
| T7 | GPT-5.6 Sol | max |

## Acceptance

- Tests never write outside workspace or temporary directories.
- `codepass clear` cannot delete unrelated files for unsafe configured paths.
- Routed tasks survive provider startup and workspace-trust prompts.
- Routed handoffs start with the real task, not placeholder narrative.
- Mechanical refresh does not collect raw diffs or clobber narrative sections.
- Session logs distinguish process exit from an explicit task outcome.
- GPT-5.6 routing fails soft to broadly available models.
- CodePass docs are current and the standalone model-router folder is gone.
