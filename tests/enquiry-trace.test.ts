import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEnquiryTrace, MAX_TRACE_CONTACTS } from '../src/enquiry-trace.ts';
import type { EnquiryTraceInput, TraceContact } from '../src/enquiry-trace.ts';

const peer = (patch:Partial<TraceContact> = {}):TraceContact => ({id:'P1',target:'peer',specificDestinationReported:false,
  uncertaintyReported:true,enquiryDurationSec:10,followUpDisposition:null,...patch});
const later = (patch:Partial<TraceContact> = {}):TraceContact => ({id:'L1',target:'leader',specificDestinationReported:true,
  uncertaintyReported:false,enquiryDurationSec:20,followUpDisposition:'not-recorded',...patch});
const scenario = (contacts:TraceContact[]):EnquiryTraceInput => ({provenance:'synthetic',priorInformation:'none',contacts});

test('first peer closure reuses the established rule and rejects contacts after closure', () => {
  const contact=peer({specificDestinationReported:true,uncertaintyReported:false});
  const run=evaluateEnquiryTrace(scenario([contact]));
  assert.equal(run.finalState,'closed-on-peer-report'); assert.equal(run.closureBasis,'first-peer-rule');
  assert.equal(run.enquiryEnded,true); assert.equal(run.enquiryTotalSec,10);
  assert.deepEqual(run.events.map(e=>[e.startOffsetSec,e.endOffsetSec]),[[0,10]]);
  assert.equal(run.independentVerification,'not-established');
  assert.throws(()=>evaluateEnquiryTrace(scenario([contact,later()])),TypeError);
  assert.equal(evaluateEnquiryTrace(scenario([peer({specificDestinationReported:true})])).finalState,'follow-up-required');
});

test('a precise later answer does not fill the missing stopping rule or recorded disposition', () => {
  const run=evaluateEnquiryTrace(scenario([peer(),later()]));
  assert.equal(run.finalState,'follow-up-disposition-unknown'); assert.equal(run.enquiryEnded,null);
  assert.equal(run.closureBasis,null); assert.equal(run.enquiryTotalSec,30);
  assert.equal(run.laterStoppingRuleValidation,'not-established');
  assert.throws(()=>evaluateEnquiryTrace(scenario([peer(),later(),later({id:'L2'})])),TypeError);
});

test('later targets/dispositions are supplied trace data, not an inferred contact schedule or validated closure', () => {
  const contacts=[peer(),later({target:'dormitory-supervisor',followUpDisposition:'continue'}),
    later({id:'L2',target:'leader',followUpDisposition:'continue',enquiryDurationSec:5}),
    later({id:'H1',target:'principal',specificDestinationReported:false,uncertaintyReported:true,
      followUpDisposition:'reported-stop',enquiryDurationSec:15})];
  const run=evaluateEnquiryTrace(scenario(contacts));
  assert.equal(run.finalState,'reported-stop-after-follow-up'); assert.equal(run.enquiryEnded,true);
  assert.equal(run.closureBasis,'reported-follow-up-stop'); assert.equal(run.contactCount,4);
  assert.equal(run.enquiryTotalSec,50); assert.equal(run.independentVerification,'not-established');
  assert.equal(run.pathPolicyValidation,'not-established'); assert.equal(run.laterStoppingRuleValidation,'not-established');
  assert.deepEqual(run.events.map(e=>e.contact.target),['peer','dormitory-supervisor','leader','principal']);
  assert.throws(()=>evaluateEnquiryTrace(scenario([...contacts,later({id:'extra'})])),TypeError);
});

test('unknown duration propagates through later offsets while known subtotal and explicit zero stay distinct', () => {
  const run=evaluateEnquiryTrace(scenario([peer(),later({enquiryDurationSec:null,followUpDisposition:'continue'}),
    later({id:'L2',enquiryDurationSec:7,followUpDisposition:'continue'}),
    later({id:'L3',enquiryDurationSec:0,followUpDisposition:'reported-stop'})]));
  assert.deepEqual(run.events.map(e=>[e.startOffsetSec,e.endOffsetSec]),[[0,10],[10,null],[null,null],[null,null]]);
  assert.equal(run.enquiryTotalSec,null); assert.equal(run.knownEnquirySubtotalSec,17); assert.equal(run.unknownDurationCount,1);
  assert.equal(run.wholeVerificationSec,null); assert.equal(run.priorInformationCostSec,null);
  const zero=evaluateEnquiryTrace(scenario([peer({enquiryDurationSec:0})]));
  assert.equal(zero.enquiryTotalSec,0); assert.equal(zero.unknownDurationCount,0); assert.equal(zero.wholeVerificationSec,null);
});

test('prior-information skip and no-start traces do not invent zero whole-process cost', () => {
  const skipped=evaluateEnquiryTrace({provenance:'synthetic',priorInformation:'checker-prior-authorization',contacts:[]});
  assert.equal(skipped.finalState,'skipped-on-prior-information'); assert.equal(skipped.enquiryEnded,true);
  assert.equal(skipped.contactCount,0); assert.equal(skipped.enquiryTotalSec,0); assert.equal(skipped.priorInformationCostSec,null);
  assert.equal(skipped.wholeVerificationSec,null);
  assert.throws(()=>evaluateEnquiryTrace({...skipped.input,contacts:[peer()]}),TypeError);
  const empty=evaluateEnquiryTrace(scenario([]));
  assert.equal(empty.finalState,'not-started'); assert.equal(empty.enquiryEnded,false); assert.equal(empty.wholeVerificationSec,null);
});

test('trace records own input/event snapshots and survive JSON round-trip and deterministic replay', () => {
  const input=scenario([peer(),later({followUpDisposition:'reported-stop'})]);
  const run=evaluateEnquiryTrace(input), restored=JSON.parse(JSON.stringify(run));
  assert.deepEqual(evaluateEnquiryTrace(restored.input),run);
  input.contacts[0]!.enquiryDurationSec=99;
  assert.equal(run.input.contacts[0]!.enquiryDurationSec,10); assert.equal(run.events[0]!.contact.enquiryDurationSec,10);
  run.input.contacts[0]!.enquiryDurationSec=88;
  assert.equal(run.events[0]!.contact.enquiryDurationSec,10);
  assert.equal(run.modelVersion,'enquiry-trace-v1'); assert.equal(run.provenance,'synthetic-policy-evaluation');
});

test('validate provenance, explicit flags/dispositions, durations, anonymous IDs and bounded traces', () => {
  for(const input of [null,[],{...scenario([]),provenance:'observed'}, {...scenario([]),priorInformation:undefined},
    {...scenario([]),contacts:null},scenario([peer({target:'leader'})]),scenario([peer({followUpDisposition:'continue'})]),
    scenario([peer(),later({id:'P1'})]),scenario([peer(),later({id:'name with spaces'})]),
    scenario([peer(),later({specificDestinationReported:undefined as never})]),
    scenario([peer(),later({uncertaintyReported:undefined as never})]),
    scenario([peer(),later({enquiryDurationSec:'20' as never})]),
    scenario([peer(),later({target:'unknown' as never})]),scenario([peer(),later({followUpDisposition:null})])]) {
    assert.throws(()=>evaluateEnquiryTrace(input),TypeError);
  }
  for(const enquiryDurationSec of [-1,NaN,Infinity,86401]) {
    assert.throws(()=>evaluateEnquiryTrace(scenario([peer({enquiryDurationSec})])),RangeError);
  }
  assert.throws(()=>evaluateEnquiryTrace(scenario(Array.from({length:MAX_TRACE_CONTACTS+1},(_,i)=>
    i===0?peer():later({id:`L${i}`,followUpDisposition:'continue'})))),RangeError);
});
