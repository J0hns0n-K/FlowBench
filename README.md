# FlowBench

Browser-native TypeScript research workbench for **seated attendance verification workflows**.

**Kickoff: 2026-10-27, Asia/Seoul.** Research validity comes before feature count.

## What changed at kickoff

The initial handoff proposed a check-in queue simulator. Follow-up descriptions establish a different workflow: participants enter without an entrance queue, sit/settle, and representatives check seated attendance class by class and report to a student coordinator. The latest series, **timed by a peer according to the user**, gives seating **103 s** and eight combined class turns totalling **160 s**. Their arithmetic sum is **263 s**. This refines earlier coarse estimates; instrument, observation date, raw event boundaries and a gap-free recording remain unverified. There is no individual check-in device. “Reducing an existing check-in queue” is not an evidence-supported project claim.

The current working question is: **If attendance verification no longer gates the start of study, what changes in study-start latency, verification completion, committee workload, accuracy and interruptions?** On 2026-10-28 the user reported directly checking assigned seats and asking peers about late/out students: seating **101 s**, checking **102 s**, with other students starting study after seating. Checking is 58 s (36.25%) shorter than the previous 160 s report, a descriptive single-session difference with different methods/boundaries and unknown exception counts. Actual study-start timestamps, causal benefit and independently audited accuracy remain unknown. The user reports all non-out students were in the chapel. See the [first new-procedure record](docs/FIRST_COMMITTEE_OBSERVATION_KO.md). Legacy count/report scenarios remain separate synthetic method exercises.

## Evidence and scope

- Simulations use anonymous, **synthetic group tasks**, not student records.
- The user subsequently clarified that verification is performed **one class at a time**. Serial class ordering is now user-reported context; exact handoff gaps, durations and field validation remain unknown. Parallel verification is a proposed alternative.
- First direct field-performance/timing report is recorded. Causal speedup, independently audited error reduction, hosted app deployment and independent student software implementation are not established.
- The initial code and documentation are authored with Codex assistance. See [contributions](docs/CONTRIBUTIONS.md).
- Current scope: browser-local TypeScript, no server, login, biometrics, IoT, hardware, or school system integration.

## Project records

한국어 요약과 다음 학생 작업: [첫 세션 기록](docs/KICKOFF_KO.md).

| Record | Purpose |
| --- | --- |
| [Problem and evidence](docs/PROBLEM_VALIDATION.md) | Current procedure, corrected premise, unknowns |
| [Model contract](docs/MODEL.md) | Equations, event ordering, metric definitions |
| [Decisions](docs/DECISIONS.md) | Versioned research questions, hypotheses and decisions |
| [Related work](docs/RELATED_WORK.md) | Primary-source competitor and research audit |
| [Validation protocol](docs/VALIDATION.md) | Numerical verification versus field validation |
| [Observation sheet](docs/OBSERVATION_SHEET_KO.md) | Blank anonymous timing record and model-gap check |
| [Session phase boundaries](docs/SESSION_PHASES_KO.md) | Preparation versus verification; current engine covers verification only |
| [Peer-timed baseline](docs/PEER_TIMING_BASELINE_KO.md) | Eight reported combined class turns; 103/160/263-second accounting |
| [Planned independent start](docs/DECOUPLED_ATTENDANCE_KO.md) | Collective decision, separate outcomes and explicit assumptions |
| [Dependency model](docs/DEPENDENCY_MODEL.md) | DAG scheduling with unknown durations, distinct from measured impact |
| [New-procedure observation](docs/NEW_PROCEDURE_OBSERVATION_KO.md) | Blank event/workload/accuracy record for actual future use |
| [Assigned-seat hypothesis](docs/ASSIGNED_SEAT_HYPOTHESIS_KO.md) | User-proposed exception checks and rotating-duty roles; effects untested |
| [First direct performance](docs/FIRST_COMMITTEE_OBSERVATION_KO.md) | New-procedure report, descriptive difference, accuracy clarification and unknowns |
| [Image-derived group sizes](docs/GROUP_COUNTS_KO.md) | Provisional aggregate counts only; no names or scores |
| [Experiment log](docs/EXPERIMENT_LOG.md) | Dated commands and observed results |
| [Claim ledger](docs/CLAIM_LEDGER.md) | Permitted and unsupported claims |
| [Student workbook](docs/STUDENT_WORKBOOK.md) | Student decisions, derivations and observations still needed |
| [Sources](docs/SOURCES.md) | Source scope and retrieval limitations |
| [Repository](docs/REPOSITORY.md) | Verified remote, owner, branch and initial SHA |
| [Issues](docs/ISSUES.md) | Research and implementation work units |

## Run the local workbench

Requires Node.js >=24 and pnpm 11.25.0 (`npm install --global pnpm@11.25.0` if needed).

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

Open http://127.0.0.1:4173/. To rerun the preregistered synthetic study, use `pnpm experiment`. It records the current source revision and overwrites the dated synthetic report with the new run; use Git to preserve earlier reports.

If dependencies and `dist/` are already present, `node scripts/serve.mjs` starts the preview directly. Rebuild after source changes. The app runs locally with no external API, font or analytics dependency. No hosted deployment is claimed.

## Implemented and verified

- Pure deterministic FCFS engine plus explicit serial/parallel count-report workflows.
- 40 passing numerical/invariant/export/accounting/dependency tests, with separate TypeScript checks.
- Peer-timed baseline panel with source labels, roster counts, combined turn durations and cumulative sums; it generates no intervention prediction.
- First direct committee-check report panel: 101 s seating, 102 s verification, descriptive 58 s difference. Qualitative study start and self-reported presence are distinct from exact timing and audited accuracy.
- Separate conditional study-start dependency model. Unknown committee completion/workload stay unknown; planned status is displayed explicitly.
- Prior conditional-model role selector distinguishes another member's duty from the user's own checking turn. A checking member's study start and benefit remain unknown. Assigned-seat checking has a first user-reported performance; generalized effects remain unvalidated.
- Same-input comparisons, per-group timeline, P95 reporting wait and target-crossing metrics.
- Seeded and editable synthetic inputs; JSON/CSV serializers include provenance, assumptions, raw events and model/source versions.
- Browser checks of exact outputs, invalid ranges, reset, custom edits, 100 groups and a narrow mobile viewport.
- [Synthetic study](docs/EVALUATION.md), [machine-readable report](experiments/2026-10-27-synthetic-v1.json), and [browser QA](docs/BROWSER_QA.md).
- GitHub Actions repeats unit tests, typechecked build and the synthetic experiment.

Actual browser file-download verification was blocked by the browser permission review; serializer tests passed. This limitation remains tracked in issue #4.

![Desktop research workbench](docs/images/2026-10-27-desktop.png)

This repository is an assisted research prototype. Further model review, independently authored engineering changes and field validation remain open.
