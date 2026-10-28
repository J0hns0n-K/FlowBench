# FlowBench

**What should have to finish before students can start studying?**

[![Verify research workbench](https://github.com/J0hns0n-K/FlowBench/actions/workflows/verify.yml/badge.svg)](https://github.com/J0hns0n-K/FlowBench/actions/workflows/verify.yml)

FlowBench is a browser-native TypeScript workbench for investigating seated attendance verification. It connects a real operational problem with explicit process models, reproducible experiments and field reports. Its central question is whether attendance verification needs to block the start of study—and what happens to the people doing the checking when that dependency changes.

## The problem changed before the solution did

The initial proposal assumed an entrance check-in queue. Follow-up accounts established that students entered freely, sat in assigned seats, and were checked one class at a time. There was no entrance queue to optimize. The investigation shifted to the sequence of seating, verification, reporting and study start.

The student committee collectively decided to start study after seating and verify attendance separately. Junmo proposed checking vacant assigned seats as exceptions, then personally performed a trial, asking friends and same-grade students about late or out students. FlowBench now examines two distinct questions: **how soon non-checkers can begin studying**, and **how much time, follow-up and interruption verification still requires**.

This progression—from correcting the premise to changing the dependency—is documented in the [decision register](docs/DECISIONS.md), rather than reconstructed from a favorable result.

## Current evidence

<!-- FLOWBENCH:CURRENT:START -->
<!-- Evidence fingerprint: 308fc5d88c8fd3244bc768aa5b5b29a06df6dfa93aeb8941d8b04e3097d08893 -->
Evidence reviewed through the latest linked report received **2026-10-29**. New-procedure reports recorded: **2**. Report dates are not independently confirmed observation dates.

| Report | Seating | Attendance verification | Source |
| --- | --- | --- | --- |
| Earlier class-by-class procedure · received 2026-10-27 | 103 s | 160 s, summed across 8 class turns | [Peer timing relayed by Junmo](data/peer-timed-baseline-2026-10-27.json) |
| Committee-check report 1 · received 2026-10-28 | 101 s | 102 s | [Direct performance reported by Junmo](data/committee-observation-2026-10-28.json) |
| Committee-check report 2 · received 2026-10-29 | 72 s | 78 s | [Direct performance reported by Junmo](data/committee-observation-2026-10-29.json) |

The latest checking duration is **82 s (51.25%) shorter** than the earlier combined-turn sum. Relative to the preceding direct-performance report, checking was 24 s (23.53%) shorter. These are descriptive comparisons of different sessions and methods. Timer metadata and completion boundaries remain incompletely documented; they are not causal estimates or average improvements.

Latest context: 6 students at the school cafe and 24 in a separate class, 30 distinct students by explicit confirmation; 2 grade-level enquiry events. These counts are not a measured vacant-seat count or verified attendance denominator. Cafe attendance was already known through Junmo's prior authorization; Information availability is a possible confounding factor, not a demonstrated cause of the timing difference.

Non-checkers reportedly began study after seating. Exact study-start latency and the checker's study start remain unknown. No missed-student result was supplied for the latest session. An independently audited error rate has not been established. [Full report](docs/SECOND_COMMITTEE_OBSERVATION_KO.md).
<!-- FLOWBENCH:CURRENT:END -->

The second report introduces a new experimental variable: **what the checker already knows**. Junmo already knew the cafe participants because he had authorized them; two grade-level enquiries addressed the separate class. The investigation now distinguishes seat occupancy, known reasons and unresolved exceptions. Whether prior information reduces checking work—and what it costs to obtain, share and maintain that information—needs comparison across sessions and rotating checkers. [Read the latest field report](docs/SECOND_COMMITTEE_OBSERVATION_KO.md).

![Workbench showing two committee-check reports, prior-information context and descriptive comparisons](docs/images/2026-10-29-second-committee-report.png)

## Engineering that makes the investigation inspectable

The workbench separates three kinds of reasoning:

| Component | Engineering purpose | Inspect it |
| --- | --- | --- |
| Deterministic FCFS and count/report workflows | Compare identical synthetic workloads with explicit task ordering, server ties and reporting bottlenecks. | [Engine](src/engine.ts) · [workflow model](docs/MODEL.md) |
| Dependency graph with unknown durations | Compute earliest milestones in O(V+E). Unknown checking time propagates only through dependent paths; it never becomes zero. Role views keep the checker distinct from non-checkers. | [DAG scheduler](src/dependencies.ts) · [dependency contract](docs/DEPENDENCY_MODEL.md) |
| Field-report accounting | Validate provenance and intervals, preserve missing metadata, and calculate descriptive differences separately from simulated predictions. | [Accounting code](src/observed.ts) · [source records](data/) |

Pure functions are shared by the browser, tests and experiment runner. Verification covers hand-calculated fixtures, simultaneous events, conservation, invalid inputs, reproducible seeds, unknown propagation and adverse outcomes. JSON/CSV serializers retain synthetic inputs, raw events, assumptions and source versions; charts visualize the same calculations.

The [locked synthetic study](docs/EVALUATION.md) includes a favorable 268 s versus 78 s fixture **and** a reporting-dominated counterexample with only a 1.37% difference. Longer reporting times also reject the waiting-time hypothesis. These results expose the model's limits; they are separate from school observations.

## A focused contribution

Browser simulation and queueing algorithms have established [prior work](docs/RELATED_WORK.md). FlowBench's project-specific investigation concerns the fit between an actual seated workflow, its dependencies and the evidence needed to evaluate a change. It keeps rejected premises, failed hypotheses and unresolved quantities visible alongside working software.

The current prototype runs locally in the browser using anonymous group workloads and aggregate timing reports. Its analytical records exclude names, seat maps and individual attendance histories. This keeps the engineering question focused on process structure, verification effort and the quality of the evidence.

## People and responsibility

Junmo's reported contributions include explaining and correcting the real workflow, proposing vacant-seat exception checking, personally performing the new check, and supplying observations. The procedure decision belongs to the committee collectively; a peer supplied the earlier timing series.

The initial model formalization, code, tests and documentation were produced with Codex assistance. Individually authored model revisions and software changes will be linked as they occur. The [contribution ledger](docs/CONTRIBUTIONS.md) distinguishes field execution, measurement, design and implementation, with dated evidence for each.

## Reproduce and follow the work

Requires Node.js 24+ and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

Open http://127.0.0.1:4173/. `pnpm experiment` reproduces the synthetic study. GitHub Actions runs the tests, typechecked build, experiment and overview freshness check. Browser export serializers are tested; actual browser download completion remains an open check in [issue #4](https://github.com/J0hns0n-K/FlowBench/issues/4). The workbench is a local prototype.

Explore the [research and development records](docs/INDEX.md), [validation protocol](docs/VALIDATION.md) and [open work](docs/ISSUES.md). The overview is maintained with the evidence using the [update protocol](docs/OVERVIEW_MAINTENANCE.md).
