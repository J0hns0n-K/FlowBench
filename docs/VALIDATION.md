# Verification and field-validation protocol

## Layer 1 — software verification

Before UI work, use exact fixtures for FCFS service, ties, multiple stations, idle gaps and invalid input. Verify a workflow example by hand, ensure all reports finish, verify metric denominators and equality at the target, and test deterministic seeded generation. Additional-server monotonicity is checked on paired workloads for the FCFS primitive. This establishes arithmetic/implementation behavior, not school validity.

## Layer 2 — synthetic falsification

Execute ADR-002 H1/H2, all four reporting-duration sensitivity points, and the reporting-dominant counterexample. Include raw inputs, model version and tested source revision in results. Do not tune thresholds after observing output without a new ADR. Do not report a synthetic comparison as “reduced school checking time”.

## Layer 3 — process observation (not performed)

Junmo should first draw the actual dependency graph and confirm who checks and reports, whether activities overlap, and which event ends the process. Obtain appropriate permission before gathering aggregate timings. Do not collect names, IDs, biometrics, penalty histories, photos or student-level attendance records.

Proposed protocol, requiring student review: three independent sessions to establish structure/calibrate timing ranges, followed by two held-out sessions to assess prediction; this is a feasibility starting point, not a statistically powered efficacy study. Pre-register the dates/count before collection. Record stopwatch resolution and any uncertainty (for example, reading rounded to one second).

For each anonymous group collect only count start/end, report start/end, aggregate group size if permitted, and flags for interruption/recount. Relative seconds from session start suffice. Use anonymous group codes; keep any operational notes private.

## Layer 4 — predictive validation (not performed)

Fit inputs on calibration sessions only. Freeze the process graph and input-selection rule, then predict the held-out sessions. Report completion-time absolute error, relative error where observed duration is nonzero, and interval coverage if multiple simulations are used. Compare observed reporting wait to prediction where it can be measured.

Reject or revise the model if dependencies differ, if the residuals show systematic omissions, or if uncertainty is too wide to choose an intervention. A proposed tolerance such as 20% completion-time error must be justified and locked by the student before validation; it is not currently an approved acceptance threshold.

## Layer 5 — intervention (not performed)

Only after feasibility and permission: compare operational alternatives across comparable sessions, record confounders and count-accuracy checks, and report paired differences with uncertainty. Time savings without maintained accuracy do not establish an improvement. Predictions, observed effects, and student contribution are separate claims.
