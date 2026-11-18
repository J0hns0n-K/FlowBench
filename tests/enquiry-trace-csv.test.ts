import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEnquiryTrace } from '../src/enquiry-trace.ts';
import { enquiryTraceCsv } from '../src/enquiry-trace-csv.ts';
const meta={generatedAt:'2026-11-18T00:00:00.000Z',sourceRevision:null,sourceFingerprint:null};
function decode(csv:string){
  const [header,...lines]=csv.trimEnd().split('\r\n');const keys=header!.split(',');
  return lines.map(line=>{const cells=[...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(match=>JSON.parse(match[1]!.replaceAll('""','"')));
    assert.equal(cells.length,keys.length);return Object.fromEntries(keys.map((key,i)=>[key,cells[i]]));});
}
const contacts=[{id:'P1',target:'peer',specificDestinationReported:false,uncertaintyReported:true,enquiryDurationSec:10,followUpDisposition:null},
  {id:'L1',target:'leader',specificDestinationReported:true,uncertaintyReported:false,enquiryDurationSec:null,followUpDisposition:'continue'},
  {id:'L2',target:'leader',specificDestinationReported:true,uncertaintyReported:false,enquiryDurationSec:0,followUpDisposition:'reported-stop'}];
test('CSV preserves unknown total, explicit zero, per-contact offsets and replayable summary input',()=>{
  const run=evaluateEnquiryTrace({provenance:'synthetic',priorInformation:'none',contacts});
  const csv=enquiryTraceCsv({...run,...meta}),rows=decode(csv);
  assert.equal(csv.split('\r\n')[0]!.split(',').length,34);assert.equal(rows.length,4);
  assert.equal(rows[0]!.record_type,'summary');assert.deepEqual(evaluateEnquiryTrace(rows[0]!.input),run);
  assert.equal(rows[0]!.enquiry_total_sec,null);assert.equal(rows[0]!.known_enquiry_subtotal_sec,10);
  assert.equal(rows[2]!.enquiry_duration_sec,null);assert.equal(rows[3]!.enquiry_duration_sec,0);
  assert.equal(rows[3]!.start_offset_sec,null);assert.equal(rows[3]!.end_offset_sec,null);
  for(const row of rows){assert.equal(row.source_revision,null);assert.equal(row.whole_verification_sec,null);
    assert.equal(row.source_authenticity,'not-verified');assert.equal(row.independent_verification,'not-established');}
});
test('CSV keeps a summary for both no-start and prior-information skip without inventing whole-process cost',()=>{
  for(const priorInformation of ['none','checker-prior-authorization']){
    const run=evaluateEnquiryTrace({provenance:'synthetic',priorInformation,contacts:[]});const rows=decode(enquiryTraceCsv({...run,...meta}));
    assert.equal(rows.length,1);assert.equal(rows[0]!.contact_count,0);assert.equal(rows[0]!.enquiry_total_sec,0);
    assert.equal(rows[0]!.prior_information_cost_sec,null);assert.equal(rows[0]!.final_state,run.finalState);
  }
});
test('JSON-valued CSV metadata survives quotes, commas, line breaks and formula-like strings',()=>{
  const run=evaluateEnquiryTrace({provenance:'synthetic',priorInformation:'none',contacts:[]});
  for(const sourceRevision of ['=SUM(1,2)','+1','-1','@A','a,"b"\nnext','unknown','']){
    const csv=enquiryTraceCsv({...run,...meta,sourceRevision});const row=decode(csv)[0]!;
    assert.equal(row.source_revision,sourceRevision);assert.equal(row.source_authenticity,'not-verified');
    assert.ok(csv.includes('"""'+JSON.stringify(sourceRevision).slice(1,-1).replaceAll('"','""')));
  }
});
