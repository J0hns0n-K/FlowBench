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

## Planned independent-start decision follow-up

- Verified visible status: “변경 결정 · 아직 미시행”, matching the user's confirmation of next-time implementation and collective committee decision.
- Conditional panel shows previous assumed study start 4 min 23 s, planned study start 1 min 43 s, new attendance completion **unknown**. Assumptions are visible and scope is students not assigned checking duties; committee work/study start is not zero.
- Previous measured-report panel retains 103/160/263 and eight rows, labelled previous-process baseline. No old class durations assigned to new committee checks.
- Desktop and narrow mobile checks passed: 375 px client/body widths, no overflow, no error-level console logs. Temporary viewport reset. [Desktop](images/2026-10-27-planned-dependency-desktop.png) and [mobile](images/2026-10-27-planned-dependency-mobile.png) screenshots from working source based on decision snapshot `d252c5d`.
- Browser download remains untested after the earlier denial; no retry was attempted. This UI verification establishes software behavior, not implementation or intervention results.
# Rotating checking duty — 2026-10-27 follow-up

- Role selector: other member checking gives conditional study start 103 s; self checking gives unknown study start and unknown advance. Attendance completion remains unknown in both views. The UI labels the selector as a model view rather than an actual duty assignment.
- Assigned seats and vacant-seat checking appear as user-reported context and an untested user idea. No vacancy-to-absence rule or numeric speedup generated.
- Desktop and 390x844 mobile checks passed; client/body widths both 375 px, no error-level console logs. Temporary viewport reset. Previous baseline and separate synthetic fixture remain intact.
- [Desktop](images/2026-10-27-rotating-duty-desktop.png), [mobile](images/2026-10-27-rotating-duty-mobile.png), captured from modified source based on research snapshot `3b62616`.
- Existing tab was stranded on an earlier connection-refused error page; a fresh IAB tab loaded the running local preview. No browser download attempted.
## First direct committee-check report — 2026-10-28

- Verified latest panel displays 101 s seating, 102 s checking, 58 s / rounded 36.3% descriptive difference and first-report status. Presence is user-reported; independent accuracy/denominator remain unknown. Immediate study start remains qualitative.
- Previous eight baseline rows and synthetic serial 268 s remain unchanged. Prior 103/160 dependency model explicitly labelled 10월 27일 사전 모델, not updated into a measured study gain. No error-level console logs.
- [Screenshot](images/2026-10-28-first-committee-report.png) captured from working source based on report snapshot `c1eed13`. No new layout styles or browser downloads introduced.
## Second direct report and context — 2026-10-29

- Latest display: seating 72 s, checking 78 s, 24 s / rounded 23.5% shorter than the preceding 102 s report. History retains both direct records; original peer table retains eight rows.
- Context: cafe 6, separate class 24, disjoint total 30 context students, two grade-level enquiries. Prior authorization is shown as a condition; no attendance denominator or zero enquiry time derived. Latest accuracy is unknown rather than copied from the earlier report.
- Desktop screenshot: [second report](images/2026-10-29-second-committee-report.png), working source based on snapshot `5ec84f7`. At 390x844 override client/body widths both 375 px; no overflow or error-level browser logs. Viewport reset after checking. No download attempted.
