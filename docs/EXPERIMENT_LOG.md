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
