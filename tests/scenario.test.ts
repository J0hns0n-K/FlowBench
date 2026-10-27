import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG, LOCKED_GROUPS, generateGroups, seededRandom } from '../src/scenario.ts';
import { compareWorkflows } from '../src/workflow.ts';

test('locked pre-code synthetic fixture: exact event totals and hypotheses',()=>{
  const result=compareWorkflows(LOCKED_GROUPS,120);
  assert.equal(result.baseline.metrics.totalSec,268);
  assert.equal(result.candidate.metrics.totalSec,78);
  assert.equal(result.candidate.metrics.p95ReportWaitSec,26);
  assert.equal(result.savedSec,190);
  assert.ok(result.savedFraction!>=0.3);
});

test('seed has a stable known sequence; zero seed is valid',()=>{
  const random=seededRandom(1);
  assert.equal(random(),0.6270739405881613);
  assert.equal(random(),0.002735721180215478);
  assert.notEqual(seededRandom(0)(),seededRandom(1)());
});

test('generated paired inputs reproduce, retain range, and vary by seed',()=>{
  const a=generateGroups(DEFAULT_CONFIG), b=generateGroups(DEFAULT_CONFIG);
  assert.deepEqual(a,b);
  assert.notDeepEqual(a,generateGroups({...DEFAULT_CONFIG,seed:0}));
  for(const group of a){
    assert.ok(group.countSec>=25&&group.countSec<=50);
    assert.ok(group.reportSec>=5&&group.reportSec<=12);
  }
  assert.equal(new Set(a.map(g=>g.id)).size,a.length);
});

test('generator validates seed, size, duration range and ordering',()=>{
  for(const seed of [-1,1.1,2**32,NaN]) assert.throws(()=>generateGroups({...DEFAULT_CONFIG,seed}));
  for(const groups of [0,-1,1.2,101,Infinity]) assert.throws(()=>generateGroups({...DEFAULT_CONFIG,groups}));
  assert.throws(()=>generateGroups({...DEFAULT_CONFIG,countMinSec:51}));
  assert.throws(()=>generateGroups({...DEFAULT_CONFIG,reportMinSec:13}));
  assert.throws(()=>generateGroups({...DEFAULT_CONFIG,countMaxSec:Infinity}));
  assert.throws(()=>generateGroups({...DEFAULT_CONFIG,reportMinSec:0}));
});

test('reporting-dominant counterexample rejects 30 percent improvement hypothesis',()=>{
  const groups=Array.from({length:6},(_,i)=>({id:`G${i}`,countSec:1,reportSec:60}));
  const result=compareWorkflows(groups,120);
  assert.equal(result.baseline.metrics.totalSec,366);
  assert.equal(result.candidate.metrics.totalSec,361);
  assert.ok(result.savedFraction!<0.3);
  assert.equal(result.candidate.metrics.p95ReportWaitSec,300);
});
