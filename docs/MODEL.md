# Mathematical and computational model v1

This document describes the legacy count/report FCFS model. The planned independent study-start change uses the separate [dependency model](DEPENDENCY_MODEL.md), with planned/conditional status and unknown committee work preserved.

Units: seconds. The engine's time origin is the first modelled verification activity (A in the field protocol), **not** the minute-25 deadline D or an individual student's arrival timestamp. Preparation before A is not included in v1 outputs. This model has no student lateness or disciplinary-policy output.

## FCFS service primitive

Task i has ready time `a_i >= 0`, positive duration `s_i`, and stable original index. Process tasks in ascending `(a_i, index)`. For server `k = argmin_k (v_k, k)`:

```
b_i = max(a_i, v_k)        service start
d_i = b_i + s_i            completion
w_i = b_i - a_i            queue wait
v_k = d_i                  next server availability
```

The server pool starts idle at t=0. Tasks are all completed, including those finishing after the target. Primitive service durations are bounded below by one microsecond; UI group durations start at one millisecond, allowing a half-duration sensitivity point without rejecting an otherwise valid input. No fixed warm-up or steady-state M/M/c formula is used: this is a finite terminating workload. Complexity is O(N log N + Nc), chosen for bounded small school-scale scenarios; no claim of a novel event-queue algorithm.

## Attendance process alternatives

Each anonymous group g has counting duration `c_g > 0` and reporting duration `r_g > 0`.

**Serial handoff:** in input order, `countStart_g = previousReportEnd`; `countEnd_g = countStart_g + c_g`; reporting starts immediately and finishes after `r_g`. Thus `T_serial = sum(c_g + r_g)`. One-class-at-a-time ordering is now explicitly user-reported (ADR-006), but not independently observed. Zero-gap transitions and numerical durations remain assumptions.

**Parallel count / single coordinator:** all count starts equal zero; ready reports have `a_g = c_g`, `s_g = r_g`. Feed them through one FCFS coordinator. `T_parallel = max(reportEnd_g)`. No cost for synchronizing representatives, walking, recounting, or communication failure is modelled; such costs require evidence before inclusion.

## Metrics and denominators

- Total verification time: final report completion, measured from t=0.
- Mean reporting wait: `sum(reportStart_g - countEnd_g) / G`.
- P95 reporting wait: sort G waits and select position `ceil(0.95 G)`, 1-based.
- Reporting busy fraction: `sum(r_g) / T`, including initial idle time.
- Group reports beyond target: `count(reportEnd_g > targetSec) / G`; equality meets target. This is **not student late-arrival rate**.
- Completion-time change: `T_serial - T_parallel`; percentage uses `T_serial` as denominator. For empty workloads, duration and wait are zero; improvement percentage is null, not division by zero.

Keep raw per-group events with every export. With six synthetic groups, a nearest-rank P95 is the maximum; it is not a precise population-tail estimate.

## Synthetic inputs

The fixed fixture is in ADR-002. A documented unsigned-32-bit seeded generator can generate count/report durations for 1–100 anonymous groups. Same seed and configuration reproduce the task list; baseline and candidate use that identical list. Distribution parameters are assumptions, not fitted empirical estimates. Input limits reject non-finite values, negative times, duplicate IDs, non-integer capacities, and unbounded workloads.

## Accuracy, uncertainty and identifiability

A five-minute overall estimate cannot identify group count, per-group count durations, report durations, concurrency or interruptions. No numeric calibration from that single estimate is defensible. Accuracy of attendance counts is outside this time-only model. Use paired independent sessions and report distributions/intervals if empirical data become available. Synthetic single-run differences contain no statistical confidence claim.

Follow-up context (ADR-009): verification is informal inspection of seated students, not individual roll call. Roster size alone therefore does not establish a linear counting-time rule. Some checking may be cognitively unobservable or done in advance; separate count/report durations must not be invented from a combined class-turn interval. Confirm stage identifiability before using the two-stage model for field predictions.

ADR-010 separates preparation and verification: user-reported seating/settling and verification each take roughly one to two minutes; a roughly ten-second countdown occurs before the minute-25 deadline. These are unmeasured ranges with unresolved interval boundaries. For observed D<=A<=F, total post-deadline time is `(A-D)+(F-A)=P+V`. The current engine models V only. A common P preserves the absolute difference between alternatives but reduces their relative end-to-end improvement. See SESSION_PHASES_KO.md; do not add the pre-deadline countdown twice or reclassify old synthetic results as total session predictions.
