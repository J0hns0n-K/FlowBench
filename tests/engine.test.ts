import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateFCFS, percentile, MAX_TASKS } from '../src/engine.ts';

test('FCFS hand-derived fixture, unsorted arrivals and idle time', () => {
  const tasks = [{id:'C',arrivalSec:10,serviceSec:1},{id:'A',arrivalSec:0,serviceSec:3},
    {id:'B',arrivalSec:1,serviceSec:2}];
  const copy = structuredClone(tasks);
  assert.deepEqual(simulateFCFS(tasks).map(e=>[e.id,e.startSec,e.endSec,e.waitSec]),
    [['A',0,3,0],['B',3,5,2],['C',10,11,0]]);
  assert.deepEqual(tasks, copy, 'input must not be mutated');
});

test('same-time tasks retain original order and completion releases a server immediately', () => {
  const result = simulateFCFS([{id:'B',arrivalSec:0,serviceSec:2},
    {id:'A',arrivalSec:0,serviceSec:2},{id:'C',arrivalSec:2,serviceSec:1}], 2);
  assert.deepEqual(result.map(e=>[e.id,e.server,e.startSec,e.endSec]),
    [['B',0,0,2],['A',1,0,2],['C',0,2,3]]);
});

test('earliest available server wins, ties go to lowest index', () => {
  const result = simulateFCFS([{id:'A',arrivalSec:0,serviceSec:5},
    {id:'B',arrivalSec:0,serviceSec:1},{id:'C',arrivalSec:0,serviceSec:2}],2);
  assert.deepEqual(result.map(e=>[e.server,e.startSec,e.endSec]),[[0,0,5],[1,0,1],[1,1,3]]);
});

test('empty tasks produce no events; nearest-rank quantiles include small samples', () => {
  assert.deepEqual(simulateFCFS([],3),[]);
  assert.equal(percentile([],0.95),0);
  assert.equal(percentile([3,0,9,1],0.5),1);
  assert.equal(percentile([3,0,9,1],0.95),9);
  assert.equal(percentile(Array.from({length:20},(_,i)=>i+1),0.95),19);
});

test('reject invalid capacity, durations, ready times, IDs and excessive work', () => {
  const good = {id:'A',arrivalSec:0,serviceSec:1};
  for (const servers of [0,-1,1.5,101,NaN,Infinity]) assert.throws(()=>simulateFCFS([good],servers));
  for (const serviceSec of [0,-1,NaN,Infinity,86401]) assert.throws(()=>simulateFCFS([{...good,serviceSec}]));
  for (const arrivalSec of [-1,NaN,Infinity,86401]) assert.throws(()=>simulateFCFS([{...good,arrivalSec}]));
  assert.throws(()=>simulateFCFS([good,{...good}]));
  assert.throws(()=>simulateFCFS([{...good,id:'<script>'}]));
  assert.throws(()=>simulateFCFS(Array(MAX_TASKS+1).fill(good)));
  for (const p of [0,-1,1.1,NaN]) assert.throws(()=>percentile([1],p));
  assert.throws(()=>percentile([Infinity],0.95));
});

test('conservation, no server overlap, and paired extra-server monotonicity on 40 workloads', () => {
  for (let sample=0;sample<40;sample++) {
    const tasks=Array.from({length:30},(_,i)=>({id:`T${i}`,arrivalSec:((i*7+sample*13)%29)/2,
      serviceSec:((i*11+sample)%19+1)/4}));
    const one=simulateFCFS(tasks,1), three=simulateFCFS(tasks,3);
    const oneById=new Map(one.map(e=>[e.id,e]));
    assert.equal(three.length,tasks.length);
    assert.equal(new Set(three.map(e=>e.id)).size,tasks.length);
    for(const event of three) {
      assert.ok(event.startSec>=event.arrivalSec);
      assert.equal(event.endSec-event.startSec,event.serviceSec);
      assert.ok(event.waitSec<=oneById.get(event.id)!.waitSec+1e-10);
    }
    for(let server=0;server<3;server++) {
      const events=three.filter(e=>e.server===server);
      for(let i=1;i<events.length;i++) assert.ok(events[i]!.startSec>=events[i-1]!.endSec);
    }
  }
});
