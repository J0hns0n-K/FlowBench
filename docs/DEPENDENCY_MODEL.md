# Study-start dependency model v1

This is separate from the legacy synthetic FCFS count/report model and the peer-timing accounting module. It answers a conditional scheduling question, not whether a policy has empirically worked.

Each task has an ID, duration (nonnegative seconds or explicit `null`), and predecessor IDs. A zero-duration task can represent a milestone. For task i:

```
start_i = max(end_parent)       (0 when there are no parents)
end_i   = start_i + duration_i
```

If any required parent's completion is unknown, start/end are unknown. If duration is unknown, end is unknown. An unknown task does not affect an unrelated branch. Unknown is never replaced by zero. Resources are unconstrained: these are earliest dependency times, not a resource-feasibility or staffing model.

`scheduleDependencies` uses memoized depth-first traversal in O(V+E), returns events in input order, rejects cycles/duplicate IDs/missing or duplicate dependencies, and bounds graphs to 200 nodes. Known durations must be finite, nonnegative and at most 86400 seconds.

`compareStudyStartDependencies` builds two explicit example graphs:

```
Previous assumed study gate: seating(103) -> class checks(160) -> study start(0)

Planned independent start:   seating(103) -> study start(0)
                                      -> committee dispatch(?) -> checks(?)
                                                               -> committee study start(0)
```

The previous graph assumes study waited for checks; the original peer series did not separately timestamp study start. The new graph assumes the same seating duration and no extra transition/interruption. It makes no assumption about the new committee's check duration or workload.

Outputs 263 versus 103 seconds, and their 160-second difference, have `provenance=conditional-model`. `measuredAdvanceSec`, `committeePersonSeconds` and new check completion remain null. Do not describe these as measured savings, removed labor or recovered learning.

The known study-start milestone is scoped to students not assigned attendance duties. Committee members' study start follows their checking branch and remains unknown. It is invalid to multiply the modelled advance by the entire roster of 120 and call it recovered student time.

The collective decision is reported as **not yet implemented**. Field validation is issue #7; software correctness is tested independently of implementation status or school validity.
