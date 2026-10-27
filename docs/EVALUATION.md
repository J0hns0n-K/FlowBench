# Synthetic evaluation — 2026-10-27

**Not school measurements. Not empirical efficacy.** Inputs and targets were locked in ADR-002 before engine implementation. No parameters were fitted to the user's approximate five-minute estimate.

Reproduction: `pnpm experiment` (or `node scripts/experiment.ts`).

Executed source revision: `2c9e8e1ef8c8fa1eee612c5a86c0d3b35a923380`, clean for the model and experiment code at execution.

Full raw events and metadata: [2026-10-27-synthetic-v1.json](../experiments/2026-10-27-synthetic-v1.json).

## Locked fixture

Six groups with counting times `[32,38,41,35,44,30]` s, reporting time 8 s each, experimental completion target 120 s.

| Metric | Serial handoff assumption | Parallel count / one coordinator assumption |
| --- | --- | --- |
| Total completion | 268 s | 78 s |
| Mean reporting wait | 0 s | 13.333… s |
| Nearest-rank P95 reporting wait | 0 s | 26 s |
| Reports completing after 120 s | 4 / 6 | 0 / 6 |
| Reporting busy fraction, from t=0 to completion | 17.91% | 61.54% |

H1 (at least 30% shorter completion) holds for this fixture: `(268-78)/268 = 70.90%`. H2 (P95 reporting wait <=30 s) also holds: 26 s. “Holds” is an arithmetic benchmark outcome, not statistical support for a school intervention.

The parallel report order is G06, G01, G04, G02, G03, G05, completing at 38, 46, 54, 62, 70 and 78 s respectively. This is independently checkable by hand.

## Preregistered sensitivity, all points

| Report-duration multiplier | Serial total | Parallel total | Parallel P95 reporting wait | H1 >=30% | H2 <=30 s |
| --- | --- | --- | --- | --- | --- |
| 0.5 | 244 s | 54 s | 6 s | Holds for fixture | Holds for fixture |
| 1 | 268 s | 78 s | 26 s | Holds for fixture | Holds for fixture |
| 2 | 316 s | 126 s | 66 s | Holds for fixture | **Rejected** |
| 4 | 412 s | 222 s | 146 s | Holds for fixture | **Rejected** |

Counting in parallel can shift the bottleneck to reporting. A shorter total duration alone does not establish acceptable waiting or real feasibility.

## Adverse counterexample

Six groups, count time 1 s and report time 60 s each: serial 366 s, parallel 361 s, improvement only **1.37%**, parallel P95 reporting wait 300 s. Both H1 and H2 are rejected for this workload. Parallelism provides little benefit when indivisible coordinator reporting dominates.

Under cost-free simultaneous counting, the model structurally favors parallelism or ties; it does not demonstrate that real coordination is cost-free. Sensitivity and counterexamples describe that boundary, rather than validate it. Manual errors, communication interruptions and compliance remain outside the model. There is no estimate of attendance accuracy, actual study time gained, participant benefit, confidence interval or field effect.

## Next empirical falsification

First inspect the real dependency graph. If the current process already overlaps counts, the serial comparison is not a credible actual baseline. Replace it before calibrating. Then obtain permitted aggregate timings, reserve held-out sessions, and compare predicted completion/reporting wait with observations. Reject the model if its structure or errors are unacceptable. Record Junmo's own decisions and implementation separately from this AI-assisted work.
