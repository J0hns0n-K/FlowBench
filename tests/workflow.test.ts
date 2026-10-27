import test from 'node:test';
import assert from 'node:assert/strict';
import { compareWorkflows, simulateWorkflow } from '../src/workflow.ts';

const groups=[{id:'A',countSec:10,reportSec:5},{id:'B',countSec:2,reportSec:5},
  {id:'C',countSec:5,reportSec:5}];

test('hand-calculated serial workflow totals 32 seconds',()=>{
  const result=simulateWorkflow(groups,'serial',32);
  assert.deepEqual(result.events.map(e=>[e.countStartSec,e.countEndSec,e.reportStartSec,e.reportEndSec]),
    [[0,10,10,15],[15,17,17,22],[22,27,27,32]]);
  assert.equal(result.metrics.totalSec,32);
  assert.equal(result.metrics.meanReportWaitSec,0);
  assert.equal(result.metrics.reportBusyFraction,15/32);
  assert.equal(result.metrics.beyondTarget,0, 'completion at target meets target');
});

test('parallel reports become ready B/C/A order by time; output stays in input order',()=>{
  const result=simulateWorkflow(groups,'parallel',12);
  // B ready 2 -> report 2..7; C ready 5 -> 7..12; A ready 10 -> 12..17.
  assert.deepEqual(result.events.map(e=>[e.id,e.reportStartSec,e.reportEndSec,e.reportWaitSec]),
    [['A',12,17,2],['B',2,7,0],['C',7,12,2]]);
  assert.equal(result.metrics.totalSec,17);
  assert.equal(result.metrics.p95ReportWaitSec,2);
  assert.equal(result.metrics.meanReportWaitSec,4/3);
  assert.equal(result.metrics.beyondTarget,1);
  assert.equal(result.metrics.beyondTargetFraction,1/3);
  assert.equal(result.metrics.reportBusyFraction,15/17);
});

test('simultaneous reports respect original order and expose a reporting bottleneck',()=>{
  const result=simulateWorkflow([{id:'B',countSec:1,reportSec:10},{id:'A',countSec:1,reportSec:10}], 'parallel',10);
  assert.deepEqual(result.events.map(e=>[e.id,e.reportStartSec,e.reportWaitSec]),[['B',1,0],['A',11,10]]);
});

test('empty workflow is finite with undefined percentage improvement expressed as null',()=>{
  const comparison=compareWorkflows([],0);
  assert.equal(comparison.savedFraction,null);
  assert.deepEqual(comparison.baseline.metrics,{groups:0,totalSec:0,meanReportWaitSec:0,p95ReportWaitSec:0,
    maxReportWaitSec:0,reportBusyFraction:0,beyondTarget:0,beyondTargetFraction:0});
});

test('workflow validates both stages, mode and target',()=>{
  for(const countSec of [0,NaN,-1,Infinity]) assert.throws(()=>simulateWorkflow([{id:'A',countSec,reportSec:1}],'serial',1));
  assert.throws(()=>simulateWorkflow([{id:'A',countSec:1,reportSec:0}],'parallel',1));
  assert.throws(()=>simulateWorkflow(groups,'serial',NaN));
  assert.throws(()=>simulateWorkflow(groups,'serial',-1));
  assert.throws(()=>simulateWorkflow(groups,'other' as 'serial',1));
  assert.throws(()=>simulateWorkflow(Array.from({length:101},(_,i)=>({id:`G${i}`,countSec:1,reportSec:1})),'serial',1));
});

test('parallel makespan cannot exceed serial under the stated cost-free concurrency assumptions',()=>{
  for(let sample=0;sample<30;sample++){
    const input=Array.from({length:8},(_,i)=>({id:`G${i}`,countSec:(i*13+sample)%23+1,reportSec:(i*5+sample)%17+1}));
    const before=structuredClone(input), comparison=compareWorkflows(input,120);
    assert.ok(comparison.savedSec>=0);
    assert.deepEqual(input,before);
    for(const result of [comparison.baseline,comparison.candidate]){
      assert.ok(result.metrics.reportBusyFraction>=0 && result.metrics.reportBusyFraction<=1);
      assert.equal(result.events.reduce((s,e)=>s+e.reportSec,0),input.reduce((s,g)=>s+g.reportSec,0));
    }
  }
});
