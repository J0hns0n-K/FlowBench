# Decisions and hypothesis register

## ADR-001 — Reframe around seated verification

Date: 2026-10-27 (Asia/Seoul). Status: adopted for an **assisted prototype**, pending student review and field validation.

The handoff's check-in queue premise conflicts with the detailed current workflow. Model seated attendance checking and reporting instead. A hypothetical device-based check-in study would be a separate, explicitly proposed system; it is not the current baseline. No such device integration is implemented here.

## ADR-002 — Research question and synthetic experiment lock

Recorded before simulation code.

**RQ1:** With the same anonymous group counting and reporting workloads, how do serial handoff and parallel counting with a single reporting coordinator change overall completion time and reporting wait?

**RQ2 (empirical, unanswered):** Which timing and dependency assumptions describe the actual seated attendance procedure, and can a feasible change reduce total time without reducing counting accuracy?

**H1, synthetic and falsifiable:** On the locked synthetic fixture, parallel counting lowers overall completion time by at least 30% compared with strict serial handoff. Reject if `(T_serial - T_parallel) / T_serial < 0.30`. This is a benchmark hypothesis, not a school-effect estimate or algorithmic novelty claim.

**H2, synthetic and falsifiable:** On the same fixture, the candidate's nearest-rank P95 reporting wait is at most 30 seconds. Reject if `P95 > 30`. This asks whether removing one bottleneck creates another; there is no expectation that every hypothesis should pass.

Locked input v1: six anonymous groups; `countSec = [32,38,41,35,44,30]`; `reportSec = [8,8,8,8,8,8]`; all counts available at t=0; one coordinator; comparison target=120 seconds. These numbers are deliberately synthetic and **were not fitted to the user's approximate five-minute report**.

Provisional engineering criteria: `T <= 120 s` and `P95 reporting wait <= 30 s`. The values are software experiment thresholds, not a school-approved service-level requirement. Student/teacher input must justify or replace them before a field study.

Sensitivity plan, locked before execution: multiply every report duration by `[0.5, 1, 2, 4]`; hold group counting work fixed. Also test a reporting-dominant counterexample (`countSec=1`, `reportSec=60` for all groups) to challenge H1. Report each point rather than only a favorable case.

## ADR-003 — Event model and reproducibility

Use a pure, browser-compatible TypeScript FCFS scheduler with exact continuous-event times (seconds) and deterministic tie handling. No time-stepped animation determines metrics. A small model-specific workflow layer specifies dependencies; an FCFS server does not magically describe classroom observation.

Sort ready tasks by `(arrivalSec, original input index)`; choose the server with earliest available time, breaking ties by server index. Completion at t makes a server available to a task at t. The workflow report stage orders equal-time counts by original group order. Positive service durations exclude zero-time cycles. Quantiles use the nearest-rank convention.

Seeded synthetic generation is optional; paired comparisons always reuse the exact same generated task array. A seed alone is insufficient: exports include inputs, model version, units, provenance, assumptions and source revision.

## ADR-004 — Attribution and scope

The initial scaffold, model proposal, tests and implementation are Codex-authored assistance. They are not independent student engineering output. Junmo must review assumptions, derive tests, propose decisions, perform permitted observations and record his own modifications before making a student contribution claim.

No backend, auth, personal attendance records, biometrics, school registry, AI API, hardware or IoT in Early. No hosting or school deployment claim. RD candidates remain separate.

## ADR-005 — Validation hierarchy

Exact hand-calculated fixtures and invariants establish implementation correctness. Synthetic sensitivity tests examine assumptions. Held-out field observations establish model validity only after the process graph is confirmed. A prospective workflow prediction is not a measured intervention result. Counterexamples and rejected premises remain in the record.

## ADR-006 — Explicit one-class-at-a-time clarification

Date: 2026-10-27 (Asia/Seoul), after the kickoff commits. Source: direct user reply to the sequential-versus-simultaneous question: “한 반씩 해”.

Promote serial class ordering from an unresolved model assumption to **explicit user-report**. Do not promote durations or effectiveness to measured evidence. The serial workflow already computes this ordering, so its equations, model version and previous synthetic outcomes do not change. The model's zero-gap transitions remain unverified: one-class-at-a-time does not establish instantaneous reporting or class handoffs.

Update live documentation, display and export limitations accordingly. Preserve the historical synthetic report and screenshots as dated records. Prepare a blank observation sheet separating counting, reporting and gaps; use the residual between observed total time and summed count/report durations to test whether omitted transitions matter. This is a proposed measurement protocol, not collected evidence or an approved school intervention.

## ADR-007 — Aggregate roster size, excluding penalties

Date: 2026-10-27 (Asia/Seoul). User supplied a roster screenshot and explicitly requested disregarding penalty information.

Record only visible group labels and counts of nonempty name rows: eight groups, 119 rows. Treat these as provisional image-derived counts, pending scope/completeness confirmation. Do not copy names, individual scores, the screenshot or disciplinary interpretations into the repository. Do not use roster size as observed attendance, processing-time data or evidence of an improvement. Preserve the locked six-group synthetic fixture; any new scenario must explicitly distinguish roster-size provenance from synthetic timing assumptions.

## ADR-008 — Roster scope confirmed and G9-B incremented

Date: 2026-10-27 (Asia/Seoul). The user confirmed that the supplied list covers evening-study participants and reported one additional newcomer in G9-B. Update the live aggregate to G9-B=15 and total=120 across eight groups. Store no newcomer name. The earlier 119-row image count remains a historical source observation, not an error to silently rewrite in the experiment history. Distinguish this user-confirmed target roster from actual session attendance and measured timing. Scheduling and locked synthetic examples do not change.

## ADR-009 — Informal seated visual verification, without roll call

Date: 2026-10-27 (Asia/Seoul). User clarified that representatives check the seated students themselves without calling each student individually. Record this as user-report, without inventing a fixed head-counting, face-recognition, seat-scanning or checklist algorithm.

Keep measured group-level checking duration as the input. Do not derive duration by multiplying roster size by an assumed name-calling time. The model's serial service recurrence is unchanged. If visual checking begins before a class's reporting turn, or if checking start/end cannot be observed separately, document that limitation rather than fabricating separate stage durations. Aggregate turn-start-to-report-end timing can be collected first; it cannot identify checking and reporting components on its own.
