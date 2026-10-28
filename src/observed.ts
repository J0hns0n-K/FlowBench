import { finiteInRange, MAX_DURATION_SEC } from './engine.ts';

export interface PeerTimingRecord {
  schemaVersion: 1; recordId: string; sourceKind: 'user-report-of-peer-timing';
  reportedOn: string; observedOn: string | null; timingInstrument: string | null;
  rawBoundaryReadings: null; actualSessionAttendance: null; units: 'seconds';
  seatingSec: number; turns: { group: string; rosterCount: number; turnSec: number }[];
  limitations: string[];
}
export interface BaselineSummary {
  accountingVersion: 'peer-timing-accounting-v1'; source: PeerTimingRecord;
  groupCount: number; targetRosterCount: number; seatingSec: number;
  verificationSec: number; reportedPhaseSumSec: number;
  rows: { group: string; rosterCount: number; turnSec: number;
    cumulativeVerificationSec: number; cumulativeReportedPhaseSec: number }[];
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Descriptive difference between two reports; does not estimate intervention effects. */
export function compareCommitteeObservation(previousInput:unknown, input:unknown) {
  const previous=summarizePeerTiming(previousInput);
  if(!object(input)||input.schemaVersion!==1||input.sourceKind!=='user-reported-direct-performance'||
    typeof input.recordId!=='string'||!input.recordId.trim()||typeof input.reportedOn!=='string'||!Number.isFinite(Date.parse(input.reportedOn))||
    input.units!=='seconds'||typeof input.seatingSec!=='number'||typeof input.verificationSec!=='number'||
    !object(input.studyStart)||input.studyStart.nonCheckingStudents!=='immediately-after-seating-user-reported'||
    input.studyStart.waitedForVerification!==false||input.studyStart.exactStartTimestampSec!==null||
    input.studyStart.seatingToStudyLatencySec!==null||!object(input.accuracy)||
    input.accuracy.userReportedMissedStudents!==0||input.accuracy.auditMethod!==null||
    input.accuracy.auditedStudentCount!==null||input.accuracy.independentlyVerifiedMissedStudents!==null||
    !Array.isArray(input.limitations)||input.limitations.length===0||input.limitations.some(note=>typeof note!=='string'||!note.trim()))throw new TypeError('Unsupported committee observation or evidence status.');
  finiteInRange(input.seatingSec,'seatingSec',0,MAX_DURATION_SEC);
  finiteInRange(input.verificationSec,'verificationSec',0.001,MAX_DURATION_SEC);
  const checkingDifferenceSec=previous.verificationSec-input.verificationSec;
  return {provenance:'descriptive-report-comparison' as const,
    seatingSec:input.seatingSec,verificationSec:input.verificationSec,
    previousVerificationSec:previous.verificationSec,checkingDifferenceSec,
    checkingDifferenceFraction:checkingDifferenceSec/previous.verificationSec,
    seatingDifferenceSec:previous.seatingSec-input.seatingSec,
    studyStartLatencySec:null,measuredStudyAdvanceSec:null,verifiedAccuracy:null,
    source:structuredClone(input)};
}

/** Accounting of reported combined intervals, not a counterfactual simulation. */
export function summarizePeerTiming(input: unknown): BaselineSummary {
  if (!object(input) || input.schemaVersion !== 1 || input.sourceKind !== 'user-report-of-peer-timing' ||
      input.units !== 'seconds') throw new TypeError('Unsupported peer-timing record or provenance.');
  if (typeof input.recordId !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(input.recordId) ||
      typeof input.reportedOn !== 'string' || !Number.isFinite(Date.parse(input.reportedOn)) ||
      !(input.observedOn === null || typeof input.observedOn === 'string' && Number.isFinite(Date.parse(input.observedOn))) ||
      !(input.timingInstrument === null || typeof input.timingInstrument === 'string') ||
      input.rawBoundaryReadings !== null || input.actualSessionAttendance !== null) {
    throw new TypeError('Missing or unsupported source metadata.');
  }
  if (typeof input.seatingSec !== 'number') throw new TypeError('seatingSec must be numeric.');
  finiteInRange(input.seatingSec, 'seatingSec', 0, MAX_DURATION_SEC);
  if (!Array.isArray(input.turns) || input.turns.length < 1 || input.turns.length > 100 ||
      !Array.isArray(input.limitations) || input.limitations.length < 1 ||
      input.limitations.some(note => typeof note !== 'string' || !note.trim())) {
    throw new TypeError('A baseline needs 1–100 combined turns and explicit limitations.');
  }
  const ids = new Set<string>();
  for (const turn of input.turns) {
    if (!object(turn) || typeof turn.group !== 'string' || !/^[A-Za-z0-9_-]{1,20}$/.test(turn.group) || ids.has(turn.group) ||
        typeof turn.rosterCount !== 'number' || !Number.isInteger(turn.rosterCount) || turn.rosterCount < 1 || turn.rosterCount > 10000 ||
        typeof turn.turnSec !== 'number') throw new TypeError('Invalid or duplicate group/roster/turn.');
    ids.add(turn.group);
    finiteInRange(turn.turnSec, 'turnSec', 0.001, MAX_DURATION_SEC);
  }
  const source = structuredClone(input) as unknown as PeerTimingRecord;
  let verificationSec = 0;
  const rows = source.turns.map(turn => {
    verificationSec += turn.turnSec;
    return { ...turn, cumulativeVerificationSec: verificationSec,
      cumulativeReportedPhaseSec: source.seatingSec + verificationSec };
  });
  return { accountingVersion: 'peer-timing-accounting-v1', source, rows,
    groupCount: rows.length, targetRosterCount: rows.reduce((sum, row) => sum + row.rosterCount, 0),
    seatingSec: source.seatingSec, verificationSec, reportedPhaseSumSec: source.seatingSec + verificationSec };
}
