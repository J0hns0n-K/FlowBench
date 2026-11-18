import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEnquiryTrace } from '../src/enquiry-trace.ts';
import { replayEnquiryTrace } from '../src/enquiry-trace-replay.ts';
const make=()=>evaluateEnquiryTrace({provenance:'synthetic',priorInformation:'none',contacts:[{
  id:'P1',target:'peer',specificDestinationReported:false,uncertaintyReported:true,
  enquiryDurationSec:null,followUpDisposition:null}]});
test('replay tolerates JSON key order and untrusted build metadata while preserving unknowns',()=>{
  const original=make();
  const record=Object.fromEntries(Object.entries({...original,sourceRevision:'unverified',generatedAt:'untrusted'}).reverse());
  const replay=replayEnquiryTrace(JSON.stringify(record));
  assert.equal(replay.matchesStoredCalculation,true);assert.deepEqual(replay.recomputed,original);
  assert.equal(replay.recomputed.enquiryTotalSec,null);assert.equal(replay.sourceAuthenticity,'not-verified');
});
test('changed totals, event states, missing fields and verification claims are flagged',()=>{
  for(const [key,value] of [['enquiryTotalSec',0],['independentVerification','verified'],['events',[]],['finalState','closed-on-peer-report']]){
    const changed={...make(),[key as string]:value};
    const replay=replayEnquiryTrace(JSON.stringify(changed));
    assert.equal(replay.matchesStoredCalculation,false);assert.ok(replay.mismatchedFields.includes(key as string));
  }
  const missing:Record<string,unknown>={...make()};delete missing.wholeVerificationSec;
  assert.ok(replayEnquiryTrace(JSON.stringify(missing)).mismatchedFields.includes('wholeVerificationSec'));
});
test('unsupported versions, empirical provenance, malformed/oversized JSON and invalid inputs are rejected',()=>{
  for(const text of ['{','null','[]',' '.repeat(200001),JSON.stringify({...make(),schemaVersion:2}),
    JSON.stringify({...make(),modelVersion:'future'}),JSON.stringify({...make(),provenance:'observed'}),
    JSON.stringify({...make(),input:{provenance:'observed',contacts:[]}})])assert.throws(()=>replayEnquiryTrace(text));
});
test('self-consistent edits can pass replay and never establish authenticity or physical truth',()=>{
  const changed=make().input;changed.contacts[0]!.enquiryDurationSec=5;
  const replay=replayEnquiryTrace(JSON.stringify(evaluateEnquiryTrace(changed)));
  assert.equal(replay.matchesStoredCalculation,true);assert.equal(replay.recomputed.enquiryTotalSec,5);
  assert.equal(replay.sourceAuthenticity,'not-verified');assert.equal(replay.independentVerification,'not-established');
});
