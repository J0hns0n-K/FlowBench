# Architecture v1

All application computation runs in the browser; runtime has no external network dependency. Development uses Node >=24, TypeScript 5.9.3 and a lockfile. Native Node type stripping runs tests without transpilation; TypeScript separately checks types. There is no backend or application dependency to hide the algorithm.

```
scenario.ts  (fixed or seeded synthetic group workloads)
     |
workflow.ts (count/report dependency assumptions)
     |
engine.ts   (pure deterministic FCFS recurrence and quantiles)
     |
export.ts   (versioned raw inputs, events, metrics, provenance)
     |
app.ts      (browser controls and SVG/table rendering)
```

The UI calls the same pure functions as the tests and experiment runner. It must not calculate an alternative waiting-time estimate or silently fit the user's five-minute estimate. Baseline and candidate receive the same task array. Changing a model assumption requires a decision record and revised tests.

The display uses a timing chart and tables rather than an animation controlling the simulation. Exported metadata records the source revision, dirty-state/content fingerprint when relevant, model/schema version and exact raw inputs. A desktop/mobile browser can run the finite bounded workloads synchronously without a worker; scale increases require a measured performance decision first.

JSON exports preserve complete results and input configuration. CSV includes one row per group per variant, with provenance and assumptions on every row. No participant names or actual attendance records are stored, imported or sent. No LocalStorage persistence is required; a reload resets the experiment unless a synthetic input file is deliberately imported in a future version.

Build: typecheck -> compile TypeScript -> copy static HTML/CSS -> stamp source metadata. Preview serves only `dist/` over loopback. No external fonts, analytics, APIs or asset downloads at runtime.

Manual source evidence and field measurements remain separate from browser output. A correct engine cannot validate an incorrect process graph.

The peer-timed field baseline uses a separate `observed.ts` accounting module, not the two-stage synthetic engine. It accepts only the explicit peer-report source schema, validates combined intervals/roster data, preserves unknown metadata and computes sums/cumulative values. Two explicitly allowlisted JSON files (peer baseline and collective decision) are bundled and fingerprinted. No names, scores or private source artifacts are bundled. Synthetic JSON/CSV exports remain synthetic-only.

`dependencies.ts` computes earliest dependency times on a validated DAG in O(V+E), with explicit null propagation. `study-start.ts` constructs a separately labelled conditional comparison, leaving new verification and workload unknown. It does not change the empirical accounting or reuse class-turn service times for new committee checks. Resource feasibility and classroom interruption remain field questions, not implied graph outputs.
