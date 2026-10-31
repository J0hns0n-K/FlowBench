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

`inquiry-policy.ts` is an isolated first-contact decision module, not yet used by the UI. It accepts explicitly synthetic answer-specificity/uncertainty flags and numeric or unknown enquiry time. It closes on a peer report only when a specific destination is reported without reported uncertainty; otherwise it returns leader/supervisor follow-up options. Both paths retain independent verification as not established. It rejects empirical provenance and missing flags. This does not infer confidence from text, contact anyone, classify actual student attendance, validate a reported destination or model later contacts. Source rules and assisted formalization are distinguished in ESCALATION_PROCEDURE_KO.md.

Field reports use a separate `observed.ts` accounting module, not the two-stage synthetic engine. It validates peer and direct-performance reports, preserves unknown accuracy metadata, and compares either the original baseline or consecutive direct reports. Context accounting distinguishes reported student counts, category overlap and enquiry events; it does not derive attendance from the roster. The explicit reviewed-report index in overview-state.json controls bundled direct records and browser history. The build adds the peer baseline and historical decision, fingerprints the index and selected records, and emits a public report index. The latest report stays separate from the prior conditional model. No names, signed records or private source artifacts are bundled; synthetic exports remain synthetic-only.

`dependencies.ts` computes earliest dependency times on a validated DAG in O(V+E), with explicit null propagation. `study-start.ts` constructs a separately labelled conditional comparison, leaving new verification and workload unknown. It does not change the empirical accounting or reuse class-turn service times for new committee checks. Resource feasibility and classroom interruption remain field questions, not implied graph outputs.

`scripts/project-overview.mjs` uses the validated field accounting to synchronize README's current-evidence block. An explicit reviewed-report index controls selection; a content fingerprint catches changes to evidence and engineering records. CI rejects stale generated content. Narrative, attribution and comparability still require editorial review as described in OVERVIEW_MAINTENANCE.md.
