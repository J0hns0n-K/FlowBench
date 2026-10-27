# Experiment and verification log

Dates use Asia/Seoul.

## 2026-10-27 — kickoff and rejected premise

- Read handoff; connected existing local Git repository to the user-provided GitHub repository.
- Verified remote owner, public visibility, default branch main, account push permissions and starting SHA `ab2b2d95dd796b61a0643b35d0a5ffa3e7388b88`.
- Detailed user clarification rejected the entrance-queue premise. Current concern is seated attendance-verification duration, estimated about five minutes, unmeasured.
- Reviewed primary related-work pages listed in SOURCES.md. No competitor performance benchmark or full-paper review claimed.
- Tried original EC/Common App discovery with connected Drive; both calls returned unknown-tool errors. Original-source audit remains incomplete.
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
- Original-source audit, actual observation/model validity, independent student contribution and application deadline remain unverified.
- Final boundary review found that halving the minimum UI report duration must remain a supported service duration. Lowered the primitive positive bound to one microsecond and added a regression fixture. The current suite has **22 passing tests**; the original 21-test result above remains the historical first engine check.
