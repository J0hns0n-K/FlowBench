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

/** Validate a direct report without carrying forward another session's accuracy claim. */
export function summarizeCommitteeObservation(input:unknown) {
  const count=(value:unknown)=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=10000;
  if(!object(input)||input.schemaVersion!==1||input.sourceKind!=='user-reported-direct-performance'||
    typeof input.recordId!=='string'||!input.recordId.trim()||typeof input.reportedOn!=='string'||!Number.isFinite(Date.parse(input.reportedOn))||
    input.units!=='seconds'||typeof input.seatingSec!=='number'||typeof input.verificationSec!=='number'||
    !object(input.studyStart)||!['immediately-after-seating-user-reported','after-verification-user-reported','not-reported'].includes(String(input.studyStart.nonCheckingStudents))||
    input.studyStart.waitedForVerification!==(input.studyStart.nonCheckingStudents==='not-reported'?null:input.studyStart.nonCheckingStudents==='after-verification-user-reported')||input.studyStart.exactStartTimestampSec!==null||
    input.studyStart.seatingToStudyLatencySec!==null||!object(input.accuracy)||
    !(input.accuracy.userReportedMissedStudents===null||count(input.accuracy.userReportedMissedStudents))||input.accuracy.auditMethod!==null||
    input.accuracy.auditedStudentCount!==null||input.accuracy.independentlyVerifiedMissedStudents!==null||
    !Array.isArray(input.limitations)||input.limitations.length===0||input.limitations.some(note=>typeof note!=='string'||!note.trim()))throw new TypeError('Unsupported committee observation or evidence status.');
  finiteInRange(input.seatingSec,'seatingSec',0,MAX_DURATION_SEC);
  finiteInRange(input.verificationSec,'verificationSec',0.001,MAX_DURATION_SEC);
  let exceptionSummary:{cafeStudents:number;classStudents:number;distinctContextStudents:number|null;inquiryEvents:number;inquiryDurationSec:number|null;cafeKnownThroughUserAuthorization:boolean}|null=null;
  if(input.exceptionContext!==undefined){
    const context=input.exceptionContext;
    if(!object(context)||!count(context.offCampusOutingCount)||!count(context.cafeStudentCount)||!count(context.cafeInquiryEvents)||
      !count(context.inquiryEventCount)||!Array.isArray(context.separateClassGroups)||
      context.separateClassGroups.length>100||![true,false,null].includes(context.cafeAndClassDisjoint as boolean|null)||
      !(context.inquiryDurationSec===null||typeof context.inquiryDurationSec==='number'))throw new TypeError('Invalid exception context.');
    let classStudents=0,questions=context.cafeInquiryEvents as number;
    const groups=new Set<string>();
    for(const group of context.separateClassGroups){
      if(!object(group)||typeof group.group!=='string'||!group.group.trim()||groups.has(group.group)||
        !count(group.studentCount)||!count(group.inquiryEvents))throw new TypeError('Invalid class context.');
      groups.add(group.group);classStudents+=group.studentCount as number;questions+=group.inquiryEvents as number;
    }
    if(questions!==context.inquiryEventCount)throw new TypeError('Inquiry event totals do not match.');
    if(context.inquiryDurationSec!==null)finiteInRange(context.inquiryDurationSec,'inquiryDurationSec',0,MAX_DURATION_SEC);
    const cafeStudents=context.cafeStudentCount as number;
    exceptionSummary={cafeStudents,classStudents,distinctContextStudents:context.cafeAndClassDisjoint===true?cafeStudents+classStudents:null,
      inquiryEvents:questions,inquiryDurationSec:context.inquiryDurationSec,cafeKnownThroughUserAuthorization:context.cafeInformationSource==='prior-authorization-by-user'};
  }
  return {reportedOn:input.reportedOn,recordId:input.recordId,seatingSec:input.seatingSec,verificationSec:input.verificationSec,
    studyStartReport:input.studyStart.nonCheckingStudents as string,
    reportedMissedStudents:input.accuracy.userReportedMissedStudents as number|null,
    exceptionSummary,source:structuredClone(input)};
}

/** Descriptive comparison with a peer baseline or a previous direct-performance report. */
export function compareCommitteeObservation(previousInput:unknown, input:unknown) {
  const previous=object(previousInput)&&previousInput.sourceKind==='user-report-of-peer-timing'?
    summarizePeerTiming(previousInput):summarizeCommitteeObservation(previousInput);
  const latest=summarizeCommitteeObservation(input);
  const checkingDifferenceSec=previous.verificationSec-latest.verificationSec;
  return {provenance:'descriptive-report-comparison' as const,
    ...latest,
    previousVerificationSec:previous.verificationSec,checkingDifferenceSec,
    checkingDifferenceFraction:checkingDifferenceSec/previous.verificationSec,
    seatingDifferenceSec:previous.seatingSec-latest.seatingSec,
    studyStartLatencySec:null,measuredStudyAdvanceSec:null,verifiedAccuracy:null,
  };
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
