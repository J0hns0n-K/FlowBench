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
