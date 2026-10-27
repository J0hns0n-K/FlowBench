# FlowBench

Browser-native TypeScript research workbench for **seated attendance verification workflows**.

**Kickoff: 2026-10-27, Asia/Seoul.** Research validity comes before feature count.

## What changed at kickoff

The initial handoff proposed a check-in queue simulator. Follow-up descriptions establish a different workflow: participants enter without an entrance queue, sit down, and class representatives check attendance in lower-grade-first order and report to a student coordinator. The overall process is estimated at about five minutes; this is **user self-report, not a measured baseline**. There is no individual check-in device. Consequently, “reducing an existing check-in queue” is not an evidence-supported project claim.

The working research question is now: **Under explicitly stated counting and reporting assumptions, how does the organization of attendance verification affect total completion time and the coordinator's reporting bottleneck?** Whether changing the real process is useful remains an empirical question.

## Evidence and scope

- Simulations use anonymous, **synthetic group tasks**, not student records.
- Sequential and parallel verification are model assumptions; “lower-grade-first” does not yet prove strict serial execution.
- No measured speedup, error reduction, deployment, or independent student implementation is established.
- The initial code and documentation are authored with Codex assistance. See [contributions](docs/CONTRIBUTIONS.md).
- Early: browser-local TypeScript, no server, login, biometrics, IoT, hardware, or school system integration.
- DormSense and RoboMetrics remain separate, unimplemented RD research candidates.

## Project records

| Record | Purpose |
| --- | --- |
| [Problem and evidence](docs/PROBLEM_VALIDATION.md) | Current procedure, corrected premise, unknowns |
| [Model contract](docs/MODEL.md) | Equations, event ordering, metric definitions |
| [Decisions](docs/DECISIONS.md) | Versioned research questions, hypotheses and decisions |
| [Related work](docs/RELATED_WORK.md) | Primary-source competitor and research audit |
| [Validation protocol](docs/VALIDATION.md) | Numerical verification versus field validation |
| [Experiment log](docs/EXPERIMENT_LOG.md) | Dated commands and observed results |
| [Claim ledger](docs/CLAIM_LEDGER.md) | Permitted and unsupported claims |
| [Admissions evidence](docs/ADMISSIONS_EVIDENCE.md) | Prior activities, source status and attribution limits |
| [Student workbook](docs/STUDENT_WORKBOOK.md) | Student decisions, derivations and observations still needed |
| [Sources](docs/SOURCES.md) | Source scope and retrieval limitations |
| [Repository](docs/REPOSITORY.md) | Verified remote, owner, branch and initial SHA |
| [Issues](docs/ISSUES.md) | Research and implementation work units |

Run instructions and verification results will be added as the testable prototype is implemented. This repository is an assisted research starting point, not proof of a completed student EC.
