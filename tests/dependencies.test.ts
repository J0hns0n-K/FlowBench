import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleDependencies } from '../src/dependencies.ts';
import { compareStudyStartDependencies } from '../src/study-start.ts';

test('serial dependency chain yields hand-calculated study-start milestone', () => {
  const result = scheduleDependencies([
    {id:'study',durationSec:0,dependsOn:['check']},
    {id:'check',durationSec:160,dependsOn:['seat']},
    {id:'seat',durationSec:103,dependsOn:[]},
  ]);
  assert.equal(result[0]!.earliestEndSec,263);
  assert.equal(result[1]!.earliestStartSec,103);
  assert.deepEqual(result.map(event=>event.id),['study','check','seat']);
});

test('fork/join waits for longest dependency path and does not mutate tasks', () => {
  const tasks=[{id:'join',durationSec:2,dependsOn:['a','b']},
    {id:'a',durationSec:5,dependsOn:[]},{id:'b',durationSec:8,dependsOn:[]}];
  const before=structuredClone(tasks), result=scheduleDependencies(tasks);
  assert.equal(result[0]!.earliestStartSec,8);
  assert.equal(result[0]!.earliestEndSec,10);
  assert.deepEqual(tasks,before);
});

test('unknown duration does not contaminate an independent study-start branch', () => {
  const result=scheduleDependencies([{id:'seat',durationSec:103,dependsOn:[]},
    {id:'unknown_check',durationSec:null,dependsOn:['seat']},
    {id:'study',durationSec:0,dependsOn:['seat']}]);
  assert.equal(result[1]!.earliestEndSec,null);
  assert.equal(result[2]!.earliestEndSec,103);
});

test('unknown duration propagates to dependent tasks without being replaced by zero', () => {
  const result=scheduleDependencies([{id:'check',durationSec:null,dependsOn:[]},
    {id:'study',durationSec:0,dependsOn:['check']}]);
  assert.equal(result[0]!.earliestStartSec,0);
  assert.equal(result[0]!.earliestEndSec,null);
  assert.equal(result[1]!.earliestStartSec,null);
  assert.equal(result[1]!.earliestEndSec,null);
});

test('explicit zero-duration milestone is valid and distinct from unknown', () => {
  assert.deepEqual(scheduleDependencies([]),[]);
  const result=scheduleDependencies([{id:'start',durationSec:0,dependsOn:[]}]);
  assert.equal(result[0]!.earliestEndSec,0);
});

test('reject cycles, missing references, duplicate IDs and duplicate dependency edges', () => {
  assert.throws(()=>scheduleDependencies([{id:'a',durationSec:1,dependsOn:['b']},{id:'b',durationSec:1,dependsOn:['a']}]),/cycle/);
  assert.throws(()=>scheduleDependencies([{id:'a',durationSec:1,dependsOn:['missing']}]));
  assert.throws(()=>scheduleDependencies([{id:'a',durationSec:1,dependsOn:[]},{id:'a',durationSec:2,dependsOn:[]}]));
  assert.throws(()=>scheduleDependencies([{id:'a',durationSec:1,dependsOn:[]},{id:'b',durationSec:1,dependsOn:['a','a']}]));
});

test('validate finite nonnegative durations and bounded graph size', () => {
  for(const durationSec of [-1,NaN,Infinity,86401]) assert.throws(()=>scheduleDependencies([{id:'a',durationSec,dependsOn:[]}]));
  assert.throws(()=>scheduleDependencies(Array.from({length:201},(_,i)=>({id:`T${i}`,durationSec:1,dependsOn:[]}))));
  assert.throws(()=>scheduleDependencies([{id:123 as unknown as string,durationSec:1,dependsOn:[]} ]));
});

test('policy comparison is conditional, with unknown new workload and completion preserved', () => {
  const result=compareStudyStartDependencies(103,160);
  assert.equal(result.provenance,'conditional-model');
  assert.equal(result.previousStudyStartSec,263);
  assert.equal(result.plannedStudyStartSec,103);
  assert.equal(result.conditionalAdvanceSec,160);
  assert.equal(result.newAttendanceCompletionSec,null);
  assert.equal(result.newCommitteeStudyStartSec,null);
  assert.equal(result.studyStartScope,'students-not-assigned-attendance-checking');
  assert.equal(result.committeePersonSeconds,null);
  assert.equal(result.measuredAdvanceSec,null);
  assert.equal(result.planned.find(event=>event.id==='committee_checks')!.earliestStartSec,null);
  assert.throws(()=>compareStudyStartDependencies(-1,160));
});
