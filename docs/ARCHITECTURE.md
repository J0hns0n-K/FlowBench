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
