import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizePeerTiming, summarizeCommitteeObservation, compareCommitteeObservation } from '../src/observed.ts';
import type { PeerTimingRecord } from '../src/observed.ts';

const fixture = (): PeerTimingRecord => JSON.parse(readFileSync(
  new URL('../data/peer-timed-baseline-2026-10-27.json', import.meta.url), 'utf8')) as PeerTimingRecord;

const committeeFixture=()=>JSON.parse(readFileSync(new URL('../data/committee-observation-2026-10-28.json',import.meta.url),'utf8'));
const secondFixture=()=>JSON.parse(readFileSync(new URL('../data/committee-observation-2026-10-29.json',import.meta.url),'utf8'));

test('second report compares with both the prior direct report and original class-turn baseline',()=>{
  const recent=compareCommitteeObservation(committeeFixture(),secondFixture());
  assert.equal(recent.seatingSec,72);assert.equal(recent.verificationSec,78);
  assert.equal(recent.checkingDifferenceSec,24);assert.equal(recent.checkingDifferenceFraction,24/102);
  assert.equal(recent.seatingDifferenceSec,29);
  const original=compareCommitteeObservation(fixture(),secondFixture());
  assert.equal(original.checkingDifferenceSec,82);assert.equal(original.checkingDifferenceFraction,0.5125);
});

test('context counts distinct students only after explicit disjoint confirmation and keeps enquiries as events',()=>{
  const input=secondFixture(), result=summarizeCommitteeObservation(input);
  assert.deepEqual(result.exceptionSummary,{cafeStudents:6,classStudents:24,distinctContextStudents:30,inquiryEvents:2,inquiryDurationSec:null,cafeKnownThroughUserAuthorization:true});
  assert.equal(result.source.actualSessionAttendance,null);assert.equal(result.source.vacantSeatCount,null);
  input.exceptionContext.cafeAndClassDisjoint=null;
  assert.equal(summarizeCommitteeObservation(input).exceptionSummary!.distinctContextStudents,null);
  input.exceptionContext.cafeInformationSource='not-reported';
  assert.equal(summarizeCommitteeObservation(input).exceptionSummary!.cafeKnownThroughUserAuthorization,false);
});

test('missing session accuracy is unknown and qualitative immediate start never becomes zero latency',()=>{
  const result=compareCommitteeObservation(committeeFixture(),secondFixture());
  assert.equal(result.reportedMissedStudents,null);assert.equal(result.verifiedAccuracy,null);
  assert.equal(result.studyStartLatencySec,null);assert.equal(result.measuredStudyAdvanceSec,null);
  const input=secondFixture();input.studyStart.nonCheckingStudents='not-reported';input.studyStart.waitedForVerification=null;
  assert.equal(summarizeCommitteeObservation(input).studyStartReport,'not-reported');
});

test('reject inconsistent inquiry counts and invalid/duplicate class context',()=>{
  for(const mutate of [(x:ReturnType<typeof secondFixture>)=>x.exceptionContext.inquiryEventCount=30,
    (x:ReturnType<typeof secondFixture>)=>x.exceptionContext.separateClassGroups[0].studentCount=-1,
    (x:ReturnType<typeof secondFixture>)=>x.exceptionContext.separateClassGroups[1].group='G10',
    (x:ReturnType<typeof secondFixture>)=>x.exceptionContext.inquiryDurationSec=-1]){
    const input=secondFixture();mutate(input);assert.throws(()=>summarizeCommitteeObservation(input));
  }
});

test('first committee report yields descriptive 58-second difference without invented study gain or accuracy',()=>{
  const result=compareCommitteeObservation(fixture(),committeeFixture());
  assert.equal(result.seatingSec,101);assert.equal(result.verificationSec,102);
  assert.equal(result.checkingDifferenceSec,58);assert.equal(result.checkingDifferenceFraction,0.3625);
  assert.equal(result.seatingDifferenceSec,2);
  assert.equal(result.studyStartLatencySec,null);assert.equal(result.measuredStudyAdvanceSec,null);
  assert.equal(result.verifiedAccuracy,null);assert.equal(result.provenance,'descriptive-report-comparison');
});

test('report comparison rejects wrong provenance, unsupported accuracy claims and invalid durations',()=>{
  const input=committeeFixture();
  for(const override of [{sourceKind:'synthetic'},{reportedOn:'unknown'},{limitations:[null]},{verificationSec:0},{seatingSec:NaN},
    {accuracy:{...input.accuracy,auditMethod:'independently-verified'}},
    {studyStart:{...input.studyStart,seatingToStudyLatencySec:0}}]){
    assert.throws(()=>compareCommitteeObservation(fixture(),{...input,...override}));
  }
});

test('descriptive comparison preserves slower outcomes and owns its source snapshot',()=>{
  const input=committeeFixture(), before=structuredClone(input);
  const result=compareCommitteeObservation(fixture(),{...input,verificationSec:200});
  assert.equal(result.checkingDifferenceSec,-40);assert.equal(result.checkingDifferenceFraction,-0.25);
  assert.deepEqual(input,before);
  const copy=compareCommitteeObservation(fixture(),input);input.method='changed';
  assert.notEqual(copy.source.method,'changed');
});

test('peer timing snapshot has independently calculated 103/160/263 totals and 120 roster places', () => {
  const result = summarizePeerTiming(fixture());
  assert.equal(result.groupCount, 8);
  assert.equal(result.targetRosterCount, 120);
  assert.equal(result.seatingSec, 103);
  assert.equal(result.verificationSec, 160);
  assert.equal(result.reportedPhaseSumSec, 263);
  assert.deepEqual(result.rows.map(row => row.cumulativeVerificationSec), [10,44,73,91,110,136,156,160]);
  assert.deepEqual(result.rows.map(row => row.cumulativeReportedPhaseSec), [113,147,176,194,213,239,259,263]);
});

test('source attribution and unknown metadata survive accounting without invented components', () => {
  const result = summarizePeerTiming(fixture());
  assert.equal(result.source.sourceKind, 'user-report-of-peer-timing');
  assert.equal(result.source.observedOn, null);
  assert.equal(result.source.timingInstrument, null);
  assert.equal(result.source.actualSessionAttendance, null);
  assert.deepEqual(result.rows.map(row => row.turnSec), [10,34,29,18,19,26,20,4]);
  assert.ok(result.source.limitations.some(note => note.includes('not identified')));
});

test('accounting does not mutate source and the result owns a separate snapshot', () => {
  const input = fixture(), before = structuredClone(input);
  const result = summarizePeerTiming(input);
  assert.deepEqual(input, before);
  input.turns[0]!.turnSec = 999;
  input.limitations[0] = 'changed';
  assert.equal(result.rows[0]!.turnSec, 10);
  assert.equal(result.source.turns[0]!.turnSec, 10);
  assert.notEqual(result.source.limitations[0], 'changed');
});

test('reject invalid timings, duplicate groups and non-integer roster counts', () => {
  for (const duration of [0,-1,NaN,Infinity,86401]) {
    const input = fixture(); input.turns[0]!.turnSec = duration;
    assert.throws(() => summarizePeerTiming(input));
  }
  for (const duration of [-1,NaN,Infinity]) {
    assert.throws(() => summarizePeerTiming({...fixture(), seatingSec: duration}));
  }
  const duplicate = fixture(); duplicate.turns[1]!.group = duplicate.turns[0]!.group;
  assert.throws(() => summarizePeerTiming(duplicate));
  const fractional = fixture(); fractional.turns[0]!.rosterCount = 1.5;
  assert.throws(() => summarizePeerTiming(fractional));
  assert.throws(() => summarizePeerTiming({...fixture(), turns: []}));
});

test('do not accept synthetic records, wrong units or omitted provenance as observed baselines', () => {
  assert.throws(() => summarizePeerTiming(null));
  for (const override of [{sourceKind:'synthetic'}, {units:'minutes'}, {schemaVersion:2},
    {recordId:''}, {reportedOn:'unknown'}, {limitations:[]}]) {
    assert.throws(() => summarizePeerTiming({...fixture(), ...override}));
  }
});
