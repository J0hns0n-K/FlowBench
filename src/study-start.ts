import { scheduleDependencies } from './dependencies.ts';

/** Conditional illustration only; old study gating and unchanged seating are assumptions. */
export function compareStudyStartDependencies(seatingSec: number, oldVerificationSec: number) {
  const previous = scheduleDependencies([
    { id: 'seating', durationSec: seatingSec, dependsOn: [] },
    { id: 'class_checks', durationSec: oldVerificationSec, dependsOn: ['seating'] },
    { id: 'study_start', durationSec: 0, dependsOn: ['class_checks'] },
  ]);
  const planned = scheduleDependencies([
    { id: 'seating', durationSec: seatingSec, dependsOn: [] },
    { id: 'committee_dispatch', durationSec: null, dependsOn: ['seating'] },
    { id: 'committee_checks', durationSec: null, dependsOn: ['committee_dispatch'] },
    { id: 'committee_study_start', durationSec: 0, dependsOn: ['committee_checks'] },
    { id: 'study_start', durationSec: 0, dependsOn: ['seating'] },
  ]);
  const previousStudyStartSec = previous.find(event => event.id === 'study_start')!.earliestEndSec!;
  const plannedStudyStartSec = planned.find(event => event.id === 'study_start')!.earliestEndSec!;
  return {
    modelVersion: 'study-start-dependencies-v1', provenance: 'conditional-model' as const,
    studyStartScope: 'students-not-assigned-attendance-checking' as const,
    previous, planned, previousStudyStartSec, plannedStudyStartSec,
    conditionalAdvanceSec: previousStudyStartSec - plannedStudyStartSec,
    newAttendanceCompletionSec: planned.find(event => event.id === 'committee_checks')!.earliestEndSec,
    newCommitteeStudyStartSec: planned.find(event => event.id === 'committee_study_start')!.earliestEndSec,
    measuredAdvanceSec: null, committeePersonSeconds: null,
    assumptions: [
      'The previous process waits for all attendance verification before study starts; this was not separately timed.',
      'The planned process starts study after seating, with no extra transition or interruption.',
      'Seating duration is unchanged and taken from the previous peer-timed report.',
      'Independent branches have no additional resource contention in this model.',
      'Committee dispatch, verification duration, workload and accuracy remain unknown.',
      'The known study-start branch represents students not assigned checking duties; committee study start remains unknown.',
    ],
  };
}
