# FlowBench

**What should have to finish before students can start studying?**

[![Verify research workbench](https://github.com/J0hns0n-K/FlowBench/actions/workflows/verify.yml/badge.svg)](https://github.com/J0hns0n-K/FlowBench/actions/workflows/verify.yml)

FlowBench is a browser-native TypeScript workbench for investigating seated attendance verification. It connects a real operational problem with explicit process models, reproducible experiments and field reports. Its central question is whether attendance verification needs to block the start of study—and what happens to the people doing the checking when that dependency changes.

## The problem changed before the solution did

The initial proposal assumed an entrance check-in queue. Follow-up accounts established that students entered freely, sat in assigned seats, and were checked one class at a time. There was no entrance queue to optimize. The investigation shifted to the sequence of seating, verification, reporting and study start.

The student committee collectively decided to start study after seating and verify attendance separately. Junmo proposed trying vacant-seat exception checks in the current workflow, then personally performed trials, asking friends and same-grade students about late or out students. FlowBench now examines two distinct questions: **how soon non-checkers can begin studying**, and **how much time, follow-up and interruption verification still requires**.

This progression—from correcting the premise to changing the dependency—is documented in the [decision register](docs/DECISIONS.md), rather than reconstructed from a favorable result.

## Current evidence

<!-- FLOWBENCH:CURRENT:START -->
<!-- Evidence fingerprint: 4dae7caec0c48d5ce9ea1aabf5ced5b25aba6e5946820c7c98f54fb06a471506 -->
This series contains reports with both seating and checking durations, through the linked report received **2026-10-29**: **2** reports. Separate enquiry/checking-only observations are described below. Report dates are not independently confirmed observation dates.

| Report | Seating | Attendance verification | Source |
| --- | --- | --- | --- |
| Earlier class-by-class procedure · received 2026-10-27 | 103 s | 160 s, summed across 8 class turns | [Peer timing relayed by Junmo](data/peer-timed-baseline-2026-10-27.json) |
| Committee-check report 1 · received 2026-10-28 | 101 s | 102 s | [Direct performance reported by Junmo](data/committee-observation-2026-10-28.json) |
| Committee-check report 2 · received 2026-10-29 | 72 s | 78 s | [Direct performance reported by Junmo](data/committee-observation-2026-10-29.json) |

The latest checking duration in this seating/checking series is **82 s (51.25%) shorter** than the earlier combined-turn sum. Relative to the preceding direct-performance report, checking was 24 s (23.53%) shorter. These are descriptive comparisons of different sessions and methods. Timer metadata and completion boundaries remain incompletely documented; they are not causal estimates or average improvements.

Latest context: 6 students at the school cafe and 24 in a separate class, 30 distinct students by explicit confirmation; 2 grade-level enquiry events. These counts are not a measured vacant-seat count or verified attendance denominator. Cafe attendance was already known through Junmo's prior authorization; Information availability is a possible confounding factor, not a demonstrated cause of the timing difference.

Non-checkers reportedly began study after seating. Exact study-start latency and the checker's study start remain unknown. No missed-student result was supplied for the latest session. An independently audited error rate has not been established. [Full report](docs/SECOND_COMMITTEE_OBSERVATION_KO.md).
<!-- FLOWBENCH:CURRENT:END -->

The second report introduces a new experimental variable: **what the checker already knows**. Junmo already knew the cafe participants because he had authorized them; two grade-level enquiries addressed the separate class. The investigation now distinguishes seat occupancy, known reasons and unresolved exceptions. Whether prior information reduces checking work—and what it costs to obtain, share and maintain that information—needs comparison across sessions and rotating checkers. [Read the latest field report](docs/SECOND_COMMITTEE_OBSERVATION_KO.md).

A later, explicitly **different session** supplied enquiry intervals of 14 s and 13 s, followed by a whole checking duration of **103 s** and confirmation that Junmo did no other work while waiting for answers. If the reported enquiry intervals lie within that total without overlap, **27 s (26.21%)** belongs to those intervals and **76 s** remains outside them. The residual is not a separate measurement of scanning or recording, and reducing enquiries has not been shown to recover all 27 s. This [linked checking/enquiry record](docs/INQUIRY_TIMING_01_KO.md) has no seating duration; it remains separate from the two reports containing both seating and checking. The earlier 78 s belongs to another session.

A stage-by-stage report received **2026-10-30**, explicitly confirmed as a **new, separate session**, adds countdown 10 s, seating/settling 31 s, scanning 58 s, enquiries 17 s and 23 s, and rechecking 25 s. If these durations form consecutive, complete intervals, they sum to **164 s**, including **123 s of checking** and **40 s of enquiries**. The earlier 103 s report remains unchanged. The stage sums are kept distinct from directly reported totals. These two enquiry-timed sessions each contain two questions, yet their enquiry totals differ (27 s versus 40 s); question count alone does not specify duration. The [stage report](docs/STAGE_TIMING_01_KO.md) makes rechecking an explicit task for further process analysis.

Junmo clarified that the 25 s recheck was a rough browse of what he called a dormitory layout chart, intended to look for students sitting elsewhere. Whether any seat changes were found or attendance decisions corrected was not reported; the chart's relationship to chapel seating remains unspecified. This adds a concrete failure mode to investigate: seat occupancy and student presence can differ. The next observation will record aggregate recheck outcomes alongside duration; the informal browse is not an independent accuracy audit.

The [next stage report, received **2026-10-31**](docs/STAGE_TIMING_02_KO.md), contains countdown 10 s, seating/settling 50 s, scanning 46 s, one enquiry of 11 s and rechecking 21 s. Conditional sums are **60 s preparation, 78 s checking and 138 s overall**. Checking is 45 s shorter than the preceding stage sum, while preparation is 19 s longer; scanning and rechecking also changed. Junmo reports **zero suspected seat-change cases**, which is not an audited zero-error result. There are now **five committee-check observation sessions**: two directly reported seating/checking totals, one checking/enquiry record and two stage reports, excluding the earlier peer baseline. The next design task is to specify what evidence can move an ambiguous vacant-seat case into a confirmed status; more timing reports alone will not define that behavior.

Junmo reviewed the [three-path procedure](data/student-workflow-confirmation-2026-11-04.json) on 2026-11-04: skip asking when he already knows the destination through his own authorization; otherwise ask a peer, closing after a specific destination is accepted; seek a supervisor or another leader when uncertain. That review exposed an omission in the initial scenario model, which required one first enquiry for every case. The [v2 comparison](docs/INQUIRY_SCENARIOS_KO.md) now distinguishes **prior information, peer-report closure and follow-up needed**, with editable inputs, three-part outcome bars and JSON/CSV previews. Information source is retained; neither closure route establishes independently audited accuracy.

The default hypothetical conditions each contain ten cases. Moving three cases from enquiry-based closure to prior information reduces first enquiries from ten to seven, and their assumed time from 100 to 70 seconds; four cases still need follow-up in each condition. **The cost of obtaining and sharing that information remains unknown**, as do follow-up work and whole verification time. This isolates the modeled first-enquiry difference without calling it a net saving. The full suite passes **80 tests**, including conserved workload under reallocation, all-prior cases, zero-weight unknowns, versioned exports and the confidently wrong-report counterexample. Student contributions are the reported workflow and review; code, defaults and tests are AI-assisted. Later-stage criteria and empirical validation remain open.

![Prior information reduces hypothetical first enquiries while follow-up cases and unknown costs remain explicit](docs/images/2026-11-04-prior-information.png)

## Engineering that makes the investigation inspectable

The workbench separates three kinds of reasoning:

| Component | Engineering purpose | Inspect it |
| --- | --- | --- |
| Deterministic FCFS and count/report workflows | Compare identical synthetic workloads with explicit task ordering, server ties and reporting bottlenecks. | [Engine](src/engine.ts) · [workflow model](docs/MODEL.md) |
| Dependency graph with unknown durations | Compute earliest milestones in O(V+E). Unknown checking time propagates only through dependent paths; it never becomes zero. Role views keep the checker distinct from non-checkers. | [DAG scheduler](src/dependencies.ts) · [dependency contract](docs/DEPENDENCY_MODEL.md) |
| Conditional enquiries and weighted scenarios | Apply student-described rules, preserve report provenance and unknown later work, compare answer distributions without asserting accuracy or causal savings. | [Policy](src/inquiry-policy.ts) · [scenario contract and browser checks](docs/INQUIRY_SCENARIOS_KO.md) |
| Sequential enquiry traces | Replay supplied contact paths, distinguish first-rule closure from an unvalidated later stop, and preserve unknown duration through offsets while retaining a known subtotal. Later stopping criteria remain unconfirmed. | [Trace core](src/enquiry-trace.ts) · [editable browser panel and contract](docs/ENQUIRY_TRACE_KO.md) |
| Field-report accounting | Validate provenance and intervals, preserve missing metadata, and calculate descriptive differences separately from simulated predictions. | [Accounting code](src/observed.ts) · [source records](data/) |

The separate [two-answer playground](docs/REPORT_COMPARISON_KO.md) compares two explicit interpretation rules. Junmo selected the hypothetical pair 병원 / hospital: strict text comparison returns conflict, while a single declared hospital → 병원 alias produces matching labels. Both results remain visible, and v2 JSON/CSV records preserve raw/trimmed/alias-normalized values, the exact alias table, rule versions and source fingerprints. Unknown information takes priority over agreement; matching generic labels cannot identify the same physical hospital or verify attendance. The alias implementation, dual-result interface and tests are AI-assisted; the student’s example selection and guided helper changes retain separate attribution.

An [executable limitation argument](docs/LABEL_COMPARISON_LIMITS_KO.md) holds the visible reports fixed while changing only invented physical-site relationships. Four constructed worlds produce two indistinguishable input pairs: matching labels alone cannot identify the same physical hospital. CI reproduces both witnesses and checks the saved evidence against the source fingerprint. These are post-implementation synthetic counterexamples, with empirical accuracy left unknown.

Pure functions are shared by the browser, tests and experiment runner. Verification covers hand-calculated fixtures, simultaneous events, conservation, invalid inputs, reproducible seeds, unknown propagation and adverse outcomes. JSON/CSV serializers retain synthetic inputs, raw events, assumptions and source versions; charts visualize the same calculations.

The [locked synthetic study](docs/EVALUATION.md) includes a favorable 268 s versus 78 s fixture **and** a reporting-dominated counterexample with only a 1.37% difference. Longer reporting times also reject the waiting-time hypothesis. These results expose the model's limits; they are separate from school observations.

## A focused contribution

Browser simulation and queueing algorithms have established [prior work](docs/RELATED_WORK.md). FlowBench's project-specific investigation concerns the fit between an actual seated workflow, its dependencies and the evidence needed to evaluate a change. It keeps rejected premises, failed hypotheses and unresolved quantities visible alongside working software.

A graduate's recollection, relayed by Junmo, also identifies earlier local use of what was described as the same checking approach. The graduate recalled roughly 2–3 minutes **including seating**, with about 70–80 students; no recorded average or detailed protocol was supplied. This [local precedent](docs/LOCAL_PRECEDENT_KO.md) places the investigation in a history of practice. Junmo's contribution concerns current application, explicit modeling and validation; origination of the checking method is not established. The recalled whole-process range is kept separate from current verification-only timings.

The current prototype runs locally in the browser using anonymous group workloads and aggregate timing reports. Its analytical records exclude names, seat maps and individual attendance histories. This keeps the engineering question focused on process structure, verification effort and the quality of the evidence.

## People and responsibility

Junmo's reported contributions include explaining and correcting the real workflow, proposing its current trial, personally performing checks, supplying observations and seeking prior users' experience. The procedure decision belongs to the committee collectively; a peer supplied the earlier timing series, and a graduate's recalled prior use is credited separately.

In a guided modeling exercise, Junmo supplied synthetic 120 s and 135 s cases and noticed that the more-question case would need quicker responses to finish sooner when scanning and recording costs stayed fixed. The [submitted reasoning and follow-up](docs/STUDENT_REASONING_01_KO.md) distinguish his calculations and observation from the assisted formal clarification and test implementation. This advances the model review from question count alone toward total enquiry duration.

In a [guided code extension](docs/STUDENT_WORKBOOK.md), Junmo added an explicit unknown-answer condition and reordered it after feedback showed that equality returned too early. The condition and corrected placement were saved by the student; the requirement, failing regression and diagnostic explanation were assistant-provided. A [separate synthetic comparison panel](docs/REPORT_COMPARISON_KO.md) now calls that helper, showing agreement, conflict or missing information with trimmed values and examples. The panel is assisted implementation; it neither changes the enquiry policy nor verifies real attendance.

The initial model formalization, code, tests and documentation were produced with Codex assistance. The [contribution ledger](docs/CONTRIBUTIONS.md) distinguishes guided code changes from independent work, field execution and assisted implementation, with dated evidence for each.

Junmo reports assigning other checks to the vice-president or female president and not being closely involved in their checking. Their information access, handoff method and timings remain unspecified; his own authorization knowledge is not transferred to them as an assumption. The [current project review](docs/PROJECT_STATUS_KO.md) brings together achieved functionality, field evidence, contributor roles and remaining validation boundaries.

## Reproduce and follow the work

Requires Node.js 24+ and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

Open http://127.0.0.1:4173/. `pnpm experiment` reproduces the synthetic study. GitHub Actions runs the tests, typechecked build, experiment and overview freshness check. Browser export serializers are tested; actual browser download completion remains an open check in [issue #4](https://github.com/J0hns0n-K/FlowBench/issues/4). The workbench is a local prototype.

See the [reproduction review](docs/REPRODUCTION_CHECK_KO.md) for the mobile JSON workflow and remaining validation boundaries.

Explore the [research and development records](docs/INDEX.md), [validation protocol](docs/VALIDATION.md) and [open work](docs/ISSUES.md). [Conditional enquiry scenarios](https://github.com/J0hns0n-K/FlowBench/issues/8) record the first-contact comparison scope and its limits. The overview is maintained with the evidence using the [update protocol](docs/OVERVIEW_MAINTENANCE.md).
