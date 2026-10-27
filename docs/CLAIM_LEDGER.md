# Claim ledger — 2026-10-27

| ID | Statement | Classification | Allowed use / limit |
| --- | --- | --- | --- |
| C01 | Existing GitHub repository has a main branch and README start commit. | verified-artifact | Repository metadata and starting SHA in REPOSITORY.md. |
| C02 | There is an entrance check-in queue. | superseded user-report | Rejected by the later detailed correction; do not use. |
| C03 | Participants enter freely, sit, and representatives count/report lower grades first, one class at a time. | user-report | Serial class structure explicitly clarified after kickoff; exact durations, gaps and independent observation remain unverified. |
| C04 | An earlier broad process estimate was approximately five minutes. | superseded coarse user-report | Later phase breakdown distinguishes preparation from verification; do not call this five minutes of verification or use it as calibration. |
| C05 | FlowBench reduces school attendance-check time. | unverified | No field comparison or measured effect. |
| C06 | Numerical model and browser code are independently student-authored. | unverified / false for initial assisted scaffold | AI contribution explicitly recorded; student contributions pending. |
| C07 | Browser queue simulation is a novel invention. | contradicted by related work | Do not claim. Application-specific validation may become a contribution. |
| C08 | Synthetic serial/parallel results predict the school's process accurately. | unverified | Software verification is not empirical validation. |
| C09 | Prior EC/WIS/website details are independently verified here. | unverified | Handoff-only until originals inspected. |
| C10 | DormSense/RoboMetrics are completed. | unverified | Separate RD proposals only. |
| C15 | The supplied screenshot visibly contains eight group labels and 119 nonempty name rows. | image-derived historical aggregate | Superseded as current roster size by C16; not an attendance measurement. No names or scores retained. |
| C16 | The listed groups are evening-study participants; one newcomer brings G9-B to 15 and the roster total to 120 across eight groups. | image-derived aggregate + explicit user confirmation/correction | Target roster scope confirmed by user; actual session attendance and timings not measured. No individual name retained. |
| C17 | Class representatives check seated students informally without required individual name-calling. | explicit user-report | No fixed per-person algorithm, checking speed, observed accuracy or independent field verification established. |
| C18 | An earlier account gave one-to-two minutes each for seating/settling and verification, with a pre-deadline countdown. | earlier coarse user-report | Phase durations refined by C19; countdown/hour and interval-boundary caveats remain. |
| C19 | Earlier report: entry-to-all-seated about 60 s; verification about 120 s, referencing the chapel-room clock. | historical clock-referenced approximate user-report | Current reference series is C20. Retain this coarse report's provenance; do not rewrite it as peer timing. |
| C20 | User relayed peer-timed seating 103 s and eight combined class turns summing to 160 s; reported phase sum 263 s. | user-report-of-peer-timing | First reported series only; instrument, observation date, raw boundaries and actual turnout unverified. No split count/report inputs, counterfactual benefit or gap-free end-to-end proof. |
| C21 | Student committee jointly decided to start study after seating and check attendance separately next time. | user-reported collective decision; planned | Not yet implemented; individual sole proposal, workload reduction, accuracy and measured time savings unverified. |
| C22 | A conditional dependency model yields study-start 263 s versus 103 s for non-checking students when old verification gates study and seating remains unchanged. | conditional-model | 160 s is modelled advance, not observed impact. Committee completion/study start, person-time and measured savings remain null; do not multiply advance by all 120 students. |
| C23 | The user belongs to the committee, expects rotating checking duties, and confirms individually assigned seats. | explicit user-report | Rotation cadence, concurrent staff and actual new-duty execution unknown. No personal duty roster stored. |
| C24 | Checking vacant assigned seats may reduce verification work when most seats are occupied. | user-proposed, untested hypothesis | Scan, follow-up and recording still take time; vacant seats are not automatically verified absences. No observed vacant count, rate, accuracy or speedup supplied. |

Add achieved software capabilities only after tests/run evidence. A pushed source repository is not a hosted app or school deployment.

| ID | Achieved software statement | Evidence | Limit |
| --- | --- | --- | --- |
| C11 | AI-assisted numerical engine initially passed 21 tests, then 22 after a sensitivity boundary regression was added. | EXPERIMENT_LOG.md; initial engine commit `2c9e8e1` and later workbench commit | No inference about empirical model validity or independent student authorship. |
| C12 | Browser prototype displays serial/parallel synthetic experiments on desktop/mobile. | BROWSER_QA.md and screenshots | Local preview only; no school deployment. |
| C13 | Locked synthetic fixture yields 268 s versus 78 s. | EVALUATION.md and raw event JSON | Not a measured reduction; five-minute user estimate not used for calibration. |
| C14 | JSON/CSV serializers preserve provenance and raw results. | Export unit tests | Actual browser download completion blocked by permission review. |
