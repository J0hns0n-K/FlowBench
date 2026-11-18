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

`report-consistency-ui.ts` initializes a separate synthetic two-string form after the source-metadata fetch. It calls `report-comparison-export.ts`, which calls the existing `compareDestinations` helper without duplicating its decisions. It renders the three states and trimmed values through textContent. A single run supplies versioned JSON and JSON-valued CSV content previews with raw/normalized inputs, timestamp, nullable Git revision/fingerprint, rules and evidence boundaries. Input edits clear stale previews and disable their buttons; presets create a new run. Source fetch failure leaves metadata null. This does not change enquiry-policy decisions, field reports, metrics or the other exports. No persistence or network submission is added. See REPORT_COMPARISON_KO.md for the format contract and browser checks.

As of 2026-11-18, `trimDestination` in report-consistency.ts is the shared edge-whitespace normalizer for comparison and record creation. It preserves null, blank-after-trimming, the literal 모름 marker and internal spaces as distinct values; comparison still handles missing information before equality. The UI displays the record's normalized values rather than trimming independently. Raw export inputs remain unchanged. This is a behavior-preserving refactor, with schema/model versions unchanged.

`inquiry-policy.ts` is a first-contact decision module. It accepts explicitly synthetic answer-specificity/uncertainty flags and numeric or unknown enquiry time. It closes on a peer report only when a specific destination is reported without reported uncertainty; otherwise it returns leader/supervisor follow-up options. Both paths retain independent verification as not established. It rejects empirical provenance and missing flags. This does not infer confidence from text, contact anyone, classify actual student attendance, validate a reported destination or model later contacts. Source rules and assisted formalization are distinguished in ESCALATION_PROCEDURE_KO.md.

`inquiry-scenarios.ts` v2 evaluates weighted peer-enquiry cohorts plus an optional synthetic `priorKnown` count with checker-authorization source. Prior-known cases are included in total workload but excluded from first enquiries. Counts conserve across skipped/peer-closed/follow-up outcomes. Unknown time affects positive-count queried cohorts; information acquisition/handoff cost, additional enquiry count, follow-up duration and whole verification remain null. V2 JSON/CSV retain the raw prior-information input, source, skipped count and unknown cost, with schema/model versions. Omitted prior information defaults to zero for legacy scenario inputs. `inquiry-ui.ts`, initialized after source metadata, renders editable inputs, three-part bars and content previews and invalidates stale results. The browser form is independent of field reports and the legacy queue experiment. See INQUIRY_SCENARIOS_KO.md.

Field reports use a separate `observed.ts` accounting module, not the two-stage synthetic engine. It validates peer and direct-performance reports, preserves unknown accuracy metadata, and compares either the original baseline or consecutive direct reports. Context accounting distinguishes reported student counts, category overlap and enquiry events; it does not derive attendance from the roster. The explicit reviewed-report index in overview-state.json controls bundled direct records and browser history. The build adds the peer baseline and historical decision, fingerprints the index and selected records, and emits a public report index. The latest report stays separate from the prior conditional model. No names, signed records or private source artifacts are bundled; synthetic exports remain synthetic-only.

`dependencies.ts` computes earliest dependency times on a validated DAG in O(V+E), with explicit null propagation. `study-start.ts` constructs a separately labelled conditional comparison, leaving new verification and workload unknown. It does not change the empirical accounting or reuse class-turn service times for new committee checks. Resource feasibility and classroom interruption remain field questions, not implied graph outputs.

`scripts/project-overview.mjs` uses the validated field accounting to synchronize README's current-evidence block. An explicit reviewed-report index controls selection; a content fingerprint catches changes to evidence and engineering records. CI rejects stale generated content. Narrative, attribution and comparability still require editorial review as described in OVERVIEW_MAINTENANCE.md.

As of 2026-11-18, report records use schema 2 / report-comparison-v2 and carry both strict and alias-normalized results. The root result/normalized fields retain strict semantics. aliasComparison holds hospital-label-v1, a copied exact alias table, its normalized inputs, result and rules; CSV adds six columns (22 total). normalizeDestinationLabel and exports share a frozen hospital → 병원 constant, and both paths reuse compareDestinations for unknown-before-equality. UI renders two cards from one cached run. Exact generic-label agreement is distinct from identifying a physical hospital. No attendance/enquiry-policy changes or v1 import support.

label-comparison-limits.mjs is a separate executable counterexample evaluator. Invented physical-site IDs remain in its oracle, outside the report comparator's two-string API. It groups identical visible inputs, verifies equal complete comparison records alongside opposite site-equality truth, and compares source-fingerprinted output against committed evidence (ignoring only generatedAt/sourceRevision). CI runs it without rewriting the artifact. No browser or attendance-policy integration; four worlds/two witnesses are not empirical accuracy samples.
