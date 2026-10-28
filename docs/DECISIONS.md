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

The current prototype has no backend, auth, personal attendance records, biometrics, school registry, AI API, hardware or IoT. No hosting or school deployment claim.

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

## ADR-010 — Separate preparation from verification

Date: 2026-10-27 (Asia/Seoul). User explained a roughly ten-second countdown before the minute-25 deadline, roughly one-to-two minutes to sit/settle, then roughly one-to-two minutes for class-by-class verification. Settling time was specifically identified as an inconvenience. Hour, exact phase boundaries and overlap are unconfirmed.

The earlier five-minute estimate cannot be used as verification-only latency. First measure deadline D, first verification activity A and final report F on the same clock. Model v1 continues to represent V=F-A only; it does not represent preparation P=A-D or behavior. Document T=P+V conditionally on the observed order, and qualify current UI/export scope. Preserve numerical engine and preregistered synthetic data. Do not assume uniform durations within reported ranges, sum overlapping estimates, infer an hour or claim preparation is always dominant. Any proposed preparation intervention needs its own mechanism and evidence.

## ADR-011 — Refined reported timings, preserving interval boundaries

Date reported: 2026-10-27 (Asia/Seoul). Latest user account: entry-to-all-seated about 60 s; attendance verification about 120 s. Store as approximate user-reported timing, with observation date, measurement method and raw timestamps unknown. The target roster remains eight groups / 120, not a measured session turnout.

The two phase estimates sum to 180 s, but any extra settling/handoff gap remains unknown. Do not claim an independently measured three-minute total or substitute entry-to-seated duration for deadline-to-check-start P. Record I (entry begins) and S (all seated) in addition to D/A/F. Do not split 120 s evenly across classes, infer per-person speed or change the locked synthetic model to appear calibrated. Machine-readable source record: data/reported-timings-2026-10-27.json.

## ADR-012 — Clock-referenced observation and identifiability

Date reported: 2026-10-27 (Asia/Seoul). User clarified that the chapel-room clock was consulted. Update the source record from unspecified timing method to clock-referenced approximate user-report. Do not infer stopwatch precision, clock resolution or raw event timestamps. Preserve reported durations, unknown observation date and interval-boundary limitations.

With the existing verified engine, compare two explicitly synthetic eight-group workloads, each with serial total 120 s: (count=14 s, report=1 s) and (count=1 s, report=14 s) per group. Their parallel totals are 22 s and 113 s respectively. This is an identifiability counterexample, not calibration: aggregate verification duration alone does not determine the counterfactual benefit of parallel checking. Document it in IDENTIFIABILITY_KO.md and retain field validation as open.

## ADR-013 — Peer-timed combined-turn baseline

Date reported: 2026-10-27 (Asia/Seoul). User supplied seating=103 s and class intervals in order `[10,34,29,18,19,26,20,4]` s, stating that a friend timed them. Store this as a new immutable source snapshot, separate from earlier coarse clock-referenced estimates. Instrument, observation date, raw boundary readings and actual attendance remain unknown. Do not assign the earlier clock method to the peer's new series.

Class intervals sum to 160 s; seating plus intervals sum to 263 s. Treat per-class durations as combined turns, without splitting count/report components. Implement a separate baseline-accounting module/panel that validates inputs, sums intervals and retains source limitations, with exact tests. It must not generate a parallel counterfactual, a measured speedup, student authorship or a statistical confidence claim. Preserve existing synthetic engine/fixtures/exports. See PEER_TIMING_BASELINE_KO.md.

## ADR-014 — Study starts independently of attendance completion

Date reported: 2026-10-27 (Asia/Seoul). User reported a student-committee joint decision for the next session: students start study after seating; the committee verifies attendance separately. Status is decided/not yet implemented; sole student proposal or measured impact is not established.

Pivot the working evaluation toward study-start latency, verification completion, committee person-time, accuracy and interruptions as separate outcomes. Preserve the old peer-timed snapshot as the previous process. Add a pure dependency-DAG model with explicit unknown durations: unknowns propagate only along their dependency paths and must not become zero. A zero-duration milestone is permitted. Detect invalid references and cycles. The graph assumes resources do not constrain otherwise independent tasks; new staffing/verification start/end remain unknown.

For an explicitly conditional example, previous study starts after seating(103 s) then class verification(160 s); proposed study starts after seating(103 s), while an unknown dispatch/check branch remains unresolved. The 263/103 s result is a model calculation under stated assumptions, not observed policy benefit. Model version is separate from the legacy two-stage synthetic engine. Record the collective decision source and planned status in data/decoupled-attendance-decision-2026-10-27.json and DECOUPLED_ATTENDANCE_KO.md.

## ADR-015 — Rotating duty and assigned-seat exception hypothesis

Date reported: 2026-10-27 (Asia/Seoul). User reports committee membership and rotating checks by self or another member; cadence/concurrent staffing are unspecified. User confirmed individual assigned seats and suggested that checking vacant positions could be faster because seats are mostly occupied.

Record assigned seating and planned role as user-report. Record faster vacant-seat checks as a user-suggested hypothesis, not a collective decision about a specific algorithm or measured effect. Preserve scanning/follow-up/recording cost and accuracy uncertainty. Do not treat an empty seat as an established absence or infer a zero scan cost, exact empty count, student registry or roster of duty dates.

Add role-specific views to the dependency model. When the viewer is checking, the new study-start/advance remains unknown until the checking branch is known; when not checking, the existing conditional seating-to-study branch applies. No duty schedule or individual attendance data are stored. See ASSIGNED_SEAT_HYPOTHESIS_KO.md and the new source snapshot.
## ADR-016 — First direct observation is descriptive evidence, 2026-10-28

Preserve the first new-method report separately from the previous peer series and pre-implementation decision: seating 101 s, user checking 102 s, assigned-seat scan plus peer enquiries, non-checkers studying after seating. User states all non-out students were in the chapel. Treat this as student-reported field execution and qualitative presence confirmation, not independently audited accuracy or independent software authorship. Do not convert “immediately” into zero latency. Difference from 160 s is 58 s / 36.25%, with no causal attribution, average-effect claim or invented person-time. Source instrument, timer operator, exception counts and actual date remain unknown. Preserve adverse/repeated observations in future records. Keep prior model hypothetical and separate from the new report panel; issue #7 remains open.
