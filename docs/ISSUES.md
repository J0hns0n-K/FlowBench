# Work breakdown

Six GitHub issues were created and verified by API readback on 2026-10-27.

Issue #7 was subsequently added for the planned procedure's implementation/validation.

| Work unit | Acceptance evidence | Initial status |
| --- | --- | --- |
| [#1 Validate real attendance workflow](https://github.com/J0hns0n-K/FlowBench/issues/1) | Repeat comparable observations, document instrument/boundaries and distinguish count/report/gaps; validate predictions separately. | Open: first peer-timed series received (103 s seating, 160 s combined turns); repeat/held-out validation absent |
| [#2 Lock model and hypotheses](https://github.com/J0hns0n-K/FlowBench/issues/2) | Correct false entrance-queue premise; equations, metrics, assumptions, preregistered synthetic fixtures and counterexample. | Documented; student review pending separately |
| [#3 Verify deterministic simulation engine](https://github.com/J0hns0n-K/FlowBench/issues/3) | Exact fixtures, ties, invariants, validation, reproducible inputs and comparison metrics. | Software scope complete: 22 tests and typecheck pass |
| [#4 Build browser experiment workbench](https://github.com/J0hns0n-K/FlowBench/issues/4) | Serial/parallel comparison, raw task inputs, charts, provenance, JSON/CSV exports and mobile behavior. | Implemented and browser-checked; keep open because actual file download was denied by permission review |
| [#5 Run synthetic evaluation and sensitivity](https://github.com/J0hns0n-K/FlowBench/issues/5) | H1/H2 outcomes, all locked sensitivity points, adverse counterexample, model/source version in export. | Synthetic scope complete; EVALUATION.md and raw JSON retain adverse outcomes |
| [#6 Record FlowBench engineering contributions](https://github.com/J0hns0n-K/FlowBench/issues/6) | Link project-specific designs, hand calculations, tests, code changes and field observations; distinguish contributor roles and assistance. | Open: independent model/code changes and repeatable validation evidence pending |
| [#7 Evaluate independent attendance checking](https://github.com/J0hns0n-K/FlowBench/issues/7) | Observe actual study start, committee start/end/person-time, accuracy and interruptions after implementation; preserve collective attribution. | Open: five committee-check observations: two direct seating/checking reports, one checking/enquiry report and two stage reports. Latest conditional sums: preparation 60 s, checking 78 s, whole 138 s; one enquiry 11 s and zero reported suspected seat changes. No independent accuracy audit. Next: define evidence/state/completion rules for ambiguous vacant seats before requesting more timings; see STAGE_TIMING_02_KO.md |

Issue completion is scoped precisely. Completing a software issue does not close empirical validation or student attribution.

Live issue state on GitHub is authoritative. Published artifacts were linked in issue comments and **#2, #3 and #5 were closed**. **#1, #4 and #6 remain open** for field evidence, download smoke verification and project-specific engineering contributions respectively. Closing #2 establishes a documented assisted research model, not student endorsement or empirical validity.

The dependency-model implementation does not close #7: passing graph tests is not policy implementation or field validation.
