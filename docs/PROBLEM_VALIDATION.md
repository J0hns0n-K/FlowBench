# Problem validation — 2026-10-27

## Source hierarchy

`verified-artifact`: inspected code, test result or primary publication. `user-report`: account given in this session, not an independent observation. `handoff-only`: assertion in the supplied handoff whose original source was not inspected. `synthetic`: invented experimental input, never school data. `proposed`: research design or future activity. `unknown`: not established.

## Previous procedure and baseline (user-report)

1. Participants enter the study space and sit in their places without waiting at its entrance.
2. Before the minute-25 deadline, a roughly ten-second countdown is given. The latest peer-timed series relayed by the user reports seating as **103 seconds**. Whether additional settling occurs before verification, and the hour/deadline-relative boundaries, remain unknown.
3. Class representatives check seated attendance, in lower-grade-first order, **one class at a time**. Representatives informally check seated students; there is **no required name-by-name roll call**. The exact visual-check strategy is not standardized by the user's account.
4. Representatives report attendance to a student coordinator. Latest reported class-turn intervals in order are **10, 34, 29, 18, 19, 26, 20, 4 seconds**, totalling **160 seconds**. A friend timed these according to the user. The friend's instrument, actual observation date and raw boundary readings were not supplied; do not assign the earlier coarse clock method to this series.
5. Penalty information is excluded from the analysis. No score or individual disciplinary data are used.
6. The earlier approximate five-minute statement was a broad retrospective estimate. It must **not** be treated as five minutes of verification alone. The phase estimates are user-report, not timed samples; countdown/preparation overlap is unknown.

No individual check-in step, scanning device or entrance queue is reported. The user selected the sequential-class description when asked to distinguish it from simultaneous counting. This supports serial ordering as self-report, not an independently observed process. Actual late-entry rules, handoff gaps, reporting medium, handling of absences and interruptions are not yet established. The model must not infer those rules from queueing mathematics.

## Premise correction

### Newly decided procedure — not yet implemented

The user reports a student-committee **joint discussion and decision** for next time: start study after seating, while the committee checks attendance separately. Do not attribute sole proposal to Junmo or claim implemented savings. Preserve the earlier class-turn series as the previous process. See DECOUPLED_ATTENDANCE_KO.md and issue #7.

An earlier brief reply said a queue existed. A later, more specific account explicitly says there is no entrance queue and verification happens after seating. That correction supersedes the earlier reply. The original check-in-completion versus arrival-time hypothesis is **rejected as a description of the present system**.

The identified inconvenience includes seating/settling before verification. Latest reported intervals sum to 103 seconds seating and 160 seconds verification, superseding earlier rough 60/120 estimates as the current reference series. Their sum, 263 seconds, is not an independently established deadline-relative end-to-end duration. No miscount, participant benefit or intervention effect has been verified. See PEER_TIMING_BASELINE_KO.md.

## Working problem

The current evaluation must distinguish **study start**, attendance completion, committee person-time, accuracy and interruptions. Decoupling tasks can change the path to study start without reducing verification work. A new dependency model handles this conditional structure; the existing FCFS prototype remains a legacy synthetic count/report exercise and the baseline panel remains descriptive accounting. No new-process outcomes are measured. See DECOUPLED_ATTENDANCE_KO.md.

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
## 2026-10-28 — first direct field-performance report

User reports personally scanning assigned seats and asking friends/same-grade students about late/out occupants: seating 101 s, checking 102 s, few such exceptions (no count). Non-checkers started study after seating. User clarifies all non-out students were in the chapel; independent audit/official outing cross-check not established. This advances the procedure from a next-time plan to first user-reported performance. Timing instrument/operator, actual date, exact event boundaries and interruptions/person-time are still unknown. The 58 s difference from the earlier 160 s turn sum is descriptive, not causal or an exact study-time gain. See FIRST_COMMITTEE_OBSERVATION_KO.md and source snapshots. Earlier dated plans are preserved as historical context.
## 2026-10-29 — prior knowledge is an experimental condition

The second direct-performance report is seating 72 s / checking 78 s. User reports six cafe participants already known through their prior authorization and 24 separate-class participants (G10=20, G11=4), with two grade-level enquiries. The groups are explicitly disjoint and non-checkers again started after seating. Thirty is the derived distinct context count, not an observed vacancy count or verified actual attendance. This motivates separating occupancy from unresolved exceptions and accounting for information acquisition/transfer across rotating checkers. No causal time coefficient, independently audited accuracy or exact study latency is established. Source and limits: SECOND_COMMITTEE_OBSERVATION_KO.md.
