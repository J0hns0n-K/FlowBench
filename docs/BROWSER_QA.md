# Browser verification — 2026-10-27

Local static preview at `http://127.0.0.1:4173/`; HTTP 200 verified. Tested with the supported in-app browser UI automation, not a separate browser driver. This is a local preview, not a hosted or school deployment.

| Check | Observed result |
| --- | --- |
| Locked fixture in browser | Serial 268 s, parallel 78 s, parallel P95 wait 26 s; matches engine tests. |
| Single generated group, seed 0, count=10, report=5, target=15 | Both totals 15 s, wait 0, target crossing 0/1; boundary equality correct. |
| Input edits before rerun | JSON/CSV buttons disabled; visible rerun-needed status. |
| Minimum count time greater than maximum | Error shown; old result cannot be exported. |
| Reset after invalid input | Restores locked source, six groups and 268/78 s results. |
| Custom G01 count time 32 -> 1 | Input source becomes custom synthetic; serial total becomes 237 s. |
| 100 generated groups | 100 table rows; chart explicitly shows first 10 only, preserving all raw event data in model results. |
| Minimum UI durations, one group, count/report=0.001 s | Both totals display 0.002 s; half-duration sensitivity remains valid; no error shown. |
| Narrow mobile viewport | 390x844 override produced a 375 px client area after scrollbar; body scroll width=375, no document-level horizontal overflow. Tables can scroll within their own containers. |
| Console after final reload | No error-level browser logs. |

## Bugs found and corrected

- A button originally had `id="reset"`, which shadowed `HTMLFormElement.reset()` via named properties. Renamed to `reset-scenario`, then verified reset from an invalid generated scenario and from edited data.
- Grid tracks initially honored table min-content width on mobile, causing horizontal overflow. Used zero-minimum fractional tracks and `min-width:0` on panels, then verified body width equals client width.

## Export limitation

The actual browser download action was **rejected by the automatic permission review**: the local page was not granted download authority. No workaround or alternate download surface was used. JSON/CSV serialization, metadata and JSON round-trip checks passed in unit tests, but browser download completion is **not verified**. Keep issue #4 open for an authorized user-side smoke check.

## Screenshots

Captured from the local synthetic fixture after fixes. Source was an explicitly marked modified working tree based on engine revision `2c9e8e1`; the footer/export metadata does not pretend it was a clean release build. The final build can stamp the final clean commit without changing model output.

- [Desktop](images/2026-10-27-desktop.png)
- [Mobile overview](images/2026-10-27-mobile.png)
- [Mobile comparison and timeline](images/2026-10-27-mobile-results.png)

Screenshots document software behavior only. They establish no school result or independent student authorship.

## Peer-timed baseline panel follow-up

- Local page reloaded to replace a cached earlier prototype. Verified displayed seating=1 min 43 s, class sum=2 min 40 s, phase sum=4 min 23 s, eight rows, G12 cumulative=160 s. Synthetic serial total remains 268 s and is shown in a separate section.
- Verified source labels: peer measurement relayed by user; one series; instrument/date/raw timestamps unknown; combined turns not split. Roster 120 is distinguished from actual session attendance.
- At a 390x844 override, client width and body scroll width both 375 px; eight baseline rows preserved. Viewport reset after checks. No error-level browser logs.
- [Desktop baseline](images/2026-10-27-peer-baseline-desktop.png), [mobile baseline](images/2026-10-27-peer-baseline-mobile.png). Captured from the working implementation based on source snapshot commit `8ea6825`; no clean-release SHA inferred from screenshots.
- Did not retry the previously denied browser download action. Existing serializer verification and its documented end-to-end download limitation are unchanged.
