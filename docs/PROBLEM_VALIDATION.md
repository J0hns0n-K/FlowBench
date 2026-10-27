# Problem validation — 2026-10-27

## Source hierarchy

`verified-artifact`: inspected code, test result or primary publication. `user-report`: account given in this session, not an independent observation. `handoff-only`: assertion in the supplied handoff whose original source was not inspected. `synthetic`: invented experimental input, never school data. `proposed`: research design or future activity. `unknown`: not established.

## Current workflow (user-report)

1. Participants enter the study space and sit in their places without waiting at its entrance.
2. At the scheduled time, class representatives check seated attendance, in lower-grade-first order, **one class at a time** (subsequent explicit user clarification).
3. Representatives report attendance to a student coordinator.
4. A student committee observes late entrants and records penalties separately.
5. The whole attendance check takes approximately **five minutes**, a retrospective estimate, not a timed sample.

No individual check-in step, scanning device or entrance queue is reported. The user selected the sequential-class description when asked to distinguish it from simultaneous counting. This supports serial ordering as self-report, not an independently observed process. Actual late-entry rules, handoff gaps, reporting medium, handling of absences and interruptions are not yet established. The model must not infer those rules from queueing mathematics.

## Premise correction

An earlier brief reply said a queue existed. A later, more specific account explicitly says there is no entrance queue and verification happens after seating. That correction supersedes the earlier reply. The original check-in-completion versus arrival-time hypothesis is **rejected as a description of the present system**.

The identified inconvenience is attendance-verification duration. No miscount, penalty error, student dissatisfaction, or measured loss of study time has been verified. Five minutes alone does not establish that a new system is worth adopting.

## Working problem

Investigate what determines total seated-verification time, and whether reorganizing counting and reporting could reduce completion time without increasing errors. The prototype isolates timing only; accuracy and practical adoption require separate evidence.

Two synthetic process variants are offered:

- **Serial baseline structure, user-report:** one class is checked and reported before the next starts. Durations remain synthetic and the zero-gap handoff remains an assumption.
- **Parallel count, one reporting coordinator assumption:** all groups start checking at time zero; completed counts join one FCFS reporting channel.

Neither is labelled a measured reproduction of the school. Serial ordering is now supported by the explicit one-class-at-a-time clarification; it was not inferred solely from lower-grade-first ordering. If observation reveals overlap, walking, handoff gaps, interruptions or another ordering, revise the process graph before fitting parameters.

## Open validation gate

Before recommending or describing a school improvement, the student must establish:

- Actual group count, approximate sizes, and who counts each group.
- Count start/end times, report start/end times and the definition of “finished”.
- Independently check the reported serial order, quantify gaps between count/report/class transitions, and establish how results are aggregated.
- Frequency of absences, recounts, late entrants and incomplete reports, using only approved aggregate observation.
- At least several independent sessions for calibration and a separate held-out session; predeclare how many before collection.
- Whether any operational change is allowed, and whether its accuracy remains acceptable.

Current gate: **serial class structure supported by explicit user-report; durations, zero-gap handoffs and empirical model validity unvalidated**. Use the blank [observation sheet](OBSERVATION_SHEET_KO.md). Software verification can proceed with synthetic inputs. Field validation cannot be replaced by a passing unit test.
