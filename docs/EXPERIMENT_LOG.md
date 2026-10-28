# Experiment and verification log

Dates use Asia/Seoul.

## 2026-10-27 — kickoff and rejected premise

- Read handoff; connected existing local Git repository to the user-provided GitHub repository.
- Verified remote owner, public visibility, default branch main, account push permissions and starting SHA `ab2b2d95dd796b61a0643b35d0a5ffa3e7388b88`.
- Detailed user clarification rejected the entrance-queue premise. Current concern is seated attendance-verification duration, estimated about five minutes, unmeasured.
- Reviewed primary related-work pages listed in SOURCES.md. No competitor performance benchmark or full-paper review claimed.
- Locked synthetic model/hypotheses before writing simulation code. No field data collected. No school improvement or independent student implementation established.

Subsequent verification commands and observed outputs will be appended after execution.

### Engine verification, before browser implementation

- Starter documentation commit `96c41f3b366d14d7c05b1bbc3a8bfcdd32284627` pushed and verified with `git ls-remote`.
- GitHub Issues #1–#6 created and read back. Issues #1 and #6 retain the empirical and student-evidence gates.
- `node --test tests/engine.test.ts tests/workflow.test.ts tests/scenario.test.ts tests/export.test.ts`: **21 passed, 0 failed**.
- `node node_modules/typescript/bin/tsc --noEmit`: passed.
- Test scope: exact FCFS and workflow fixtures, deterministic ties, idle time, metric denominators, target equality, invalid inputs, conservation/no overlap across varied workloads, reproducible generator and versioned JSON/CSV export.
- Locked fixture: serial 268 s, parallel 78 s, parallel nearest-rank P95 reporting wait 26 s. These are arithmetic results for synthetic assumptions; no field interpretation.

### Synthetic study and browser implementation

- Pushed engine revision `2c9e8e1ef8c8fa1eee612c5a86c0d3b35a923380`, then ran `node scripts/experiment.ts` with clean model/experiment sources. Exact raw records in `experiments/2026-10-27-synthetic-v1.json`.
- All four preregistered sensitivity points executed. Reporting durations x2/x4 reject H2. Reporting-dominant counterexample rejects H1 and H2; only 1.37% completion-time difference. See EVALUATION.md.
- Added browser app, source-version stamping, local preview server and repeatable GitHub Actions checks. `node scripts/build.mjs` typechecks before emitting browser code.
- Browser QA caught a reset-method shadowing bug and mobile grid min-content overflow; both were fixed and rechecked. Exact fixtures, invalid range handling, reset, custom editing, 100-group limit, desktop layout and narrow mobile layout were inspected. No console errors after final reload.
- Actual browser JSON-download verification was rejected by automatic permission review. It was not retried through another surface. JSON/CSV unit serialization remains verified; issue #4 retains this end-to-end verification gap.
- Screenshots captured in `docs/images/`; browser temporary viewport override reset after mobile checks.
- Actual observation/model validity and independent student engineering contribution remain unverified at this stage.
- Final boundary review found that halving the minimum UI report duration must remain a supported service duration. Lowered the primitive positive bound to one microsecond and added a regression fixture. The current suite has **22 passing tests**; the original 21-test result above remains the historical first engine check.

### Remote verification

- Workbench commit `ebcc1e334c62bf212b137a2796afc88622964a33` pushed; `git ls-remote origin refs/heads/main` matched the local HEAD. Working tree clean after commit.
- [GitHub Actions run 40462892254](https://github.com/J0hns0n-K/FlowBench/actions/runs/40462892254) returned `status=completed`, `conclusion=success` for that exact source SHA. Automated scope: dependency lock install, 22 numerical tests, typechecked browser build, synthetic experiment reproduction.
- Rebuilt the local preview from the clean published workbench commit; source metadata correctly records its SHA without a dirty suffix.
- Linked evidence in issue comments; closed #2/#3/#5 for their documented research/software/synthetic scopes. #1/#4/#6 remain open. No observation, school intervention or student-authored work was inferred from CI success.

### Follow-up — one-class-at-a-time clarification

- User clarified “한 반씩 해” in response to the sequential-versus-simultaneous question. Recorded serial class structure as explicit self-report in ADR-006; no measured time, school effect or independent authorship was added.
- Updated current context in the browser and export limitations. Numerical scheduling and existing synthetic results are unchanged. Historical experiment JSON and screenshots are preserved.
- Prepared a blank anonymous observation sheet, including counting/reporting timestamps and handoff-gap residuals. No observation, permission or measurement is represented as completed.
- Follow-up checks: `node --test tests/export.test.ts` — 4 passed; `node scripts/build.mjs` — typecheck/build passed; `git diff --check` — passed. Scheduling code was not changed and historical numerical results were not regenerated.

### Follow-up — image-derived group sizes

- User supplied a roster image and requested excluding penalty information. Counted only visible nonempty name rows by group: G6=7, G7=19, G8=21, G9-A=17, G9-B=14, G10=23, G11=14, G12=4; total 119 across eight groups.
- Classification: provisional image-derived roster-size aggregate, not independently verified session attendance or complete population. Actual verification scope remains to be confirmed.
- No names, individual scores or source image copied into the repository. No timing values inferred; no simulation input or historical synthetic result changed. Documentation-only update, so numerical tests were not rerun.

### Follow-up — roster scope confirmed, one additional participant

- User confirmed the listed groups are evening-study participants and reported one newcomer in G9-B. Updated current roster aggregate from G9-B=14 / total=119 to **G9-B=15 / total=120**, still eight groups.
- Stored only the aggregate correction, not the individual's name. Scope is now explicitly user-confirmed; actual session attendance and timing remain unmeasured.
- Retained the original 119-row image observation in history. No algorithm, synthetic fixture or earlier numerical outcome changed. Documentation-only consistency/diff checks; no repeated numerical tests needed.

### Follow-up — no individual roll call

- User clarified informal checking of seated students without individual name-calling. Added ADR-009 and C17; kept this as user-report rather than independently observed method or accuracy.
- Updated the observation protocol to allow unobservable count stages to remain missing; combined class-turn timing must not be split into fabricated component durations. No fixed seconds-per-student formula introduced.
- Documentation-only change. Numerical engine, locked synthetic data and published experiment outcomes are unchanged.

### Follow-up — preparation is a separate phase

- User refined timing: roughly ten-second countdown before a minute-25 deadline, seating/settling about one-to-two minutes, then verification about one-to-two minutes. Settling was emphasized. All are unmeasured estimates; hour, overlap and precise interval boundaries are unknown.
- Added ADR-010 and SESSION_PHASES_KO.md. Earlier five-minute context is not verification-only latency. Existing engine remains scoped to verification V, not preparation P or total T=P+V.
- Updated observation sheet with countdown, deadline, first-check and last-report markers on one clock. Qualified current browser and export scope without fitting timings or altering scheduling/locked fixtures.
- Checks: four export tests passed; typechecked browser build passed; whitespace/diff check passed. The numerical scheduling engine is unchanged.

### Follow-up — reported 60-second entry/seating and 120-second verification

- User refined phase estimates to entry-to-all-seated approximately 60 s and verification approximately 120 s. Added ADR-011/C19 and a provenance-labelled JSON record; observation date, instrument and raw timestamps remain unknown.
- The reported phase sum is 180 s, not an independently measured whole-session total; extra settling gap and deadline-relative offsets are unresolved. Observation sheet now records entry I and seated S as well as D/A/F.
- Updated live context without allocating aggregate verification time to individual classes or recalibrating synthetic fixtures. Scheduling code and earlier numerical outcomes remain unchanged.
- Checks: typechecked browser build and `git diff --check` passed. No new numeric behavior was introduced, so numerical tests were not repeated.

### Follow-up — chapel-room clock and aggregate identifiability

- User confirmed consulting the chapel-room clock. Updated timing provenance and measurement method, retaining unknown clock resolution, raw readings and observation date. The 60 s / 120 s values remain approximate, user-reported durations.
- Executed existing `compareWorkflows` on two synthetic eight-group examples: (count=14 s, report=1 s) gives serial 120 s / parallel 22 s; (count=1 s, report=14 s) gives serial 120 s / parallel 113 s. This demonstrates non-identifiability from aggregate time, not a fitted school prediction.
- Documented inputs, hand calculations and limitations in IDENTIFIABILITY_KO.md. No engine, locked fixture or timing value changed; field validation and student-authorship evidence remain open.

### First peer-timed combined-turn series and baseline display

- Preserved source snapshot and ADR-013 in commit `8ea6825e5f308506010c0acfa9f44f6225cae1c0` before display implementation. User reported a friend timed seating=103 s and class turns `[10,34,29,18,19,26,20,4]` s. Sum=160 s; reported phase sum=263 s. Instrument/date/raw boundaries/turnout remain unknown.
- Added a pure, validated accounting module and a separately labelled baseline panel. No count/report split, counterfactual candidate or improvement claim is generated from the record. Original synthetic engine and fixtures are preserved.
- `node --test tests/engine.test.ts tests/workflow.test.ts tests/scenario.test.ts tests/export.test.ts tests/observed.test.ts`: **27 passed, 0 failed**, including five baseline tests for arithmetic, cumulative sums, provenance, copying and invalid input.
- Typechecked browser build and whitespace/diff check passed. Desktop/mobile QA verified 103/160/263, eight rows and preserved synthetic result; no horizontal overflow or console errors. Screenshots and detail in BROWSER_QA.md.

### Collective decision — independent study start, planned

- User reported a change: students start study after seating; committee checks attendance separately. Follow-ups confirmed next-time implementation (not already running) and collective committee discussion/decision. No sole individual proposal or measured benefit attributed.
- Source decision and ADR-014 committed before implementation in `d252c5dccaccdb7dc6819d4f69fea0cd3e68cd45`. Created field-validation issue #7. Native GitHub integration returned repository write 403; the previously verified existing Git account successfully created the issue, without changing permissions.
- Added pure dependency-DAG scheduling with null propagation, cycle/reference validation and zero-duration milestones. Conditional comparison gives 263/103 s for non-checking students under explicit assumptions. Committee verification completion, study start, person-time and actual measured advance remain null.
- Full suite reached **35 passed, 0 failed**; focused dependency tests (8) rerun after validation/role-scope refinements passed. Typechecked build and diff checks passed. No old snapshot or synthetic fixture changed.
- Desktop/mobile QA confirmed planned status, visible assumptions, unknown attendance completion and preserved previous baseline. No horizontal overflow or console errors. Screenshots in BROWSER_QA.md.
- Prepared a separate blank observation form for actual study start, committee timing/person-time, accuracy and interruptions. No implementation, observation or approval is fabricated by the form or graph.
### Rotating duty and assigned-seat hypothesis — 2026-10-27

- User confirms committee membership, rotating duties, and individual assigned seats. User's vacant-seat idea is an untested hypothesis, separate from the collective policy decision. Source snapshot committed as `3b62616e37640127774d060e44d7c4b2d77533aa`.
- Added role-specific pure model and selector. Checker start/advance stay null; another member's checking turn uses the existing conditional non-checker branch. No new checking-time estimate is invented.
- Full numerical suite: **37 passed, 0 failed**. Typechecked build and diff whitespace checks passed. Desktop/mobile behavior and source labels verified; details in BROWSER_QA.md.
- Expanded blank observation sheet with duty role, aggregate vacant/uncertain counts, method and optional disjoint work stages. No actual intervention measurement or accuracy result recorded. Field issue #7 remains open.
### First directly performed committee check — 2026-10-28

- Preserved initial report before display work in commit `c1eed13d75f81f30fe27013910b312de1a80a0e8`: seating 101 s, user's own checking 102 s, scanning assigned seats plus peer enquiries; qualitative immediate study start confirmed. Accuracy follow-up stored separately: user says all non-out students were in the chapel, without official cross-check/denominator supplied.
- Descriptive report comparison gives 58 s / 36.25% checking difference, 2 s seating difference. Keeps measured study advance, exact study latency and verified accuracy null; negative checking differences remain negative. No causal or person-time calculation.
- Full suite **40 passed, 0 failed** with typechecked build. New tests cover arithmetic/unknowns, unsupported provenance/status/values and slower outcomes/source isolation. Browser display verified, eight previous baseline rows and synthetic result preserved. Evidence details in BROWSER_QA.md. Field validation issue #7 remains open.
### Evidence-connected project overview — 2026-10-28

- Rewrote README around the evolving question, corrected premise, actual field performance, complementary engineering models, adverse synthetic results and contributor roles. Added a research/development index and an explicit update protocol.
- Current quantitative block uses the existing validated accounting and a reviewed-report index. CI checks a fingerprint of source/tests, data, project documents and generation/build/experiment inputs. New direct-performance records require review before inclusion; narrative and screenshot updates remain editorial work.
- Typechecked browser build passed. Isolated-copy probes passed for a clean overview, stale-source rejection, unreviewed-record rejection, slower-result rendering (200 s produces 40 s / 25% longer), and LF/CRLF normalization. The probes changed only an ignored fixture copy; original field records were preserved.
