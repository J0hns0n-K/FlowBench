import test from 'node:test';
import assert from 'node:assert/strict';
import { makeExperiment, csvExport, jsonExport } from '../src/export.ts';
import { LOCKED_GROUPS } from '../src/scenario.ts';
import { compareWorkflows } from '../src/workflow.ts';

const metadata={sourceRevision:'abc123',generatedAt:'2026-10-27T09:00:00.000Z',
  generator:null,inputLabel:'Locked synthetic fixture v1'};

test('JSON retains raw inputs, provenance and all outputs for exact rerun',()=>{
  const experiment=makeExperiment(LOCKED_GROUPS,120,metadata);
  const parsed=JSON.parse(jsonExport(experiment));
  assert.deepEqual(parsed.comparison,compareWorkflows(parsed.inputs,parsed.targetSec));
  assert.equal(parsed.provenance,'synthetic');
  assert.equal(parsed.units,'seconds');
  assert.equal(parsed.sourceRevision,'abc123');
  assert.equal(parsed.comparison.candidate.events.length,6);
  assert.ok(parsed.assumptions.length>0&&parsed.limitations.length>0);
});

test('CSV carries both variants, event timing, metrics, assumptions and provenance',()=>{
  const text=csvExport(makeExperiment(LOCKED_GROUPS,120,metadata));
  const rows=text.replace(/^\ufeff/,'').trim().split('\r\n');
  assert.equal(rows.length,13);
  assert.ok(rows[0]!.includes('"source_revision"'));
  assert.ok(rows[0]!.includes('"assumptions_json"'));
  assert.ok(rows[1]!.includes('"synthetic"'));
  assert.equal(rows.filter(row=>row.includes('"serial"')).length,6);
  assert.equal(rows.filter(row=>row.includes('"parallel"')).length,6);
});

test('CSV escapes quotes/newlines and prevents formula execution in a custom label',()=>{
  const text=csvExport(makeExperiment(LOCKED_GROUPS,120,{...metadata,inputLabel:'=SUM(1,2) "label"'}));
  assert.ok(text.includes('"\'=SUM(1,2) ""label"""'));
});

test('exports clone inputs and require explicit source metadata',()=>{
  const inputs=LOCKED_GROUPS.map(g=>({...g}));
  const experiment=makeExperiment(inputs,120,metadata);
  inputs[0]!.countSec=999;
  assert.equal(experiment.inputs[0]!.countSec,32);
  assert.throws(()=>makeExperiment(LOCKED_GROUPS,120,{...metadata,sourceRevision:''}));
  assert.throws(()=>makeExperiment(LOCKED_GROUPS,120,{...metadata,generatedAt:'not-a-date'}));
});
