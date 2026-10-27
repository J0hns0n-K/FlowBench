# Problem validation — 2026-10-27

## Source hierarchy

`verified-artifact`: inspected code, test result or primary publication. `user-report`: account given in this session, not an independent observation. `handoff-only`: assertion in the supplied handoff whose original source was not inspected. `synthetic`: invented experimental input, never school data. `proposed`: research design or future activity. `unknown`: not established.

## Current workflow (user-report)

1. Participants enter the study space and sit in their places without waiting at its entrance.
2. Before the minute-25 deadline, a roughly ten-second countdown is given. The latest peer-timed series relayed by the user reports seating as **103 seconds**. Whether additional settling occurs before verification, and the hour/deadline-relative boundaries, remain unknown.
3. Class representatives check seated attendance, in lower-grade-first order, **one class at a time**. Representatives informally check seated students; there is **no required name-by-name roll call**. The exact visual-check strategy is not standardized by the user's account.
4. Representatives report attendance to a student coordinator. Latest reported class-turn intervals in order are **10, 34, 29, 18, 19, 26, 20, 4 seconds**, totalling **160 seconds**. A friend timed these according to the user. The friend's instrument, actual observation date and raw boundary readings were not supplied; do not assign the earlier coarse clock method to this series.
5. Penalty information is excluded from the analysis. No score or individual disciplinary data are used.
6. The earlier approximate five-minute statement was a broad retrospective estimate. It must **not** be treated as five minutes of verification alone. The phase estimates are user-report, not timed samples; countdown/preparation overlap is unknown.

No individual check-in step, scanning device or entrance queue is reported. The user selected the sequential-class description when asked to distinguish it from simultaneous counting. This supports serial ordering as self-report, not an independently observed process. Actual late-entry rules, handoff gaps, reporting medium, handling of absences and interruptions are not yet established. The model must not infer those rules from queueing mathematics.

## Premise correction

An earlier brief reply said a queue existed. A later, more specific account explicitly says there is no entrance queue and verification happens after seating. That correction supersedes the earlier reply. The original check-in-completion versus arrival-time hypothesis is **rejected as a description of the present system**.

The identified inconvenience includes seating/settling before verification. Latest reported intervals sum to 103 seconds seating and 160 seconds verification, superseding earlier rough 60/120 estimates as the current reference series. Their sum, 263 seconds, is not an independently established deadline-relative end-to-end duration. No miscount, participant benefit or intervention effect has been verified. See PEER_TIMING_BASELINE_KO.md.

## Working problem

First distinguish post-deadline preparation from verification, then investigate which phase an intervention could realistically change. The existing prototype isolates count/report timing **after verification starts**. It does not simulate settling, crowd behavior or time from the deadline to the first class's check. See [session phases](SESSION_PHASES_KO.md). Accuracy and practical adoption require separate evidence.

Two synthetic process variants are offered:

- **Serial baseline structure, user-report:** one class is checked and reported before the next starts. Durations remain synthetic and the zero-gap handoff remains an assumption.
- **Parallel count, one reporting coordinator assumption:** all groups start checking at time zero; completed counts join one FCFS reporting channel.

Neither is labelled a measured reproduction of the school. Serial ordering is now supported by the explicit one-class-at-a-time clarification; it was not inferred solely from lower-grade-first ordering. If observation reveals overlap, walking, handoff gaps, interruptions or another ordering, revise the process graph before fitting parameters.

## Open validation gate

A user-provided image initially yielded eight groups and 119 visible named rows. The user then confirmed these are the evening-study participants and added one newcomer to G9-B. Current roster-size aggregate: **eight groups, 120 participants; G9-B=15**. Sources are image-derived counts plus user confirmation/correction, not observed attendance. No names or scores are retained. See [group counts](GROUP_COUNTS_KO.md).

Before recommending or describing a school improvement, the student must establish:

- Maintain the user-confirmed target roster (eight groups, 120) as roster size, distinguish actual session attendance, and establish the precise counting method for each group.
- Observe the informal visual-check method without imposing a name-calling procedure. Do not assume a constant time per student or that all checking is externally visible; note if representatives have already checked before their reporting turn.
- Count start/end times, report start/end times and the definition of “finished”.
- Independently check the reported serial order, quantify gaps between count/report/class transitions, and establish how results are aggregated.
- Frequency of absences, recounts, late entrants and incomplete reports, using only approved aggregate observation.
- At least several independent sessions for calibration and a separate held-out session; predeclare how many before collection.
- Whether any operational change is allowed, and whether its accuracy remains acceptable.

Current gate: **serial class structure supported by explicit user-report; durations, zero-gap handoffs and empirical model validity unvalidated**. Use the blank [observation sheet](OBSERVATION_SHEET_KO.md). Software verification can proceed with synthetic inputs. Field validation cannot be replaced by a passing unit test.
