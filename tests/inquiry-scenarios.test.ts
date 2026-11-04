import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeEnquiryScenario, compareEnquiryScenarios, enquiryJsonExport, enquiryCsvExport } from '../src/inquiry-scenarios.ts';
import type { EnquiryCohort, EnquiryScenario } from '../src/inquiry-scenarios.ts';

const cohort = (id: string, count: number, specific: boolean, uncertain: boolean, time: number | null): EnquiryCohort =>
  ({ id, count, answer: { provenance: 'synthetic', specificDestinationReported: specific, uncertaintyReported: uncertain, enquiryDurationSec: time } });
const a: EnquiryScenario = { id: 'A', cohorts: [cohort('clear',6,true,false,10),cohort('doubt',2,true,true,10),cohort('vague',2,false,true,10)] };
const b: EnquiryScenario = { id: 'B', cohorts: [cohort('clear',4,true,false,10),cohort('doubt',4,true,true,10),cohort('vague',2,false,true,10)] };
const meta = { sourceRevision: 'test-source', generatedAt: '2026-11-02T00:00:00Z' };

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], field = '', quoted = false;
  for (let i=0;i<text.length;i++) {
    const ch=text[i]!;
    if(ch==='"') {
      if(quoted&&text[i+1]==='"'){field+='"';i++;} else quoted=!quoted;
    } else if(ch===','&&!quoted){row.push(field);field='';}
    else if(ch==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}
    else field+=ch;
  }
  assert.equal(quoted,false);
  return rows;
}

test('weighted comparison separates follow-up cases from unknown additional enquiries and time', () => {
  const run = compareEnquiryScenarios(a,b,meta), [left,right] = run.results;
  assert.equal(left.caseCount,10); assert.equal(left.closedOnPeerReport,6); assert.equal(left.followUpCaseCount,4);
  assert.equal(right.closedOnPeerReport,4); assert.equal(right.followUpCaseCount,6);
  assert.equal(left.firstEnquiryTotalSec,100); assert.equal(right.firstEnquiryTotalSec,100);
  assert.equal(run.firstEnquiryDifferenceBMinusASec,0);
  assert.equal(run.sameCaseCount,true);
  for (const result of run.results) {
    assert.equal(result.closedOnPeerReport+result.followUpCaseCount,result.caseCount);
    assert.equal(result.firstEnquiryCount,result.caseCount);
    assert.equal(result.additionalEnquiryCount,null); assert.equal(result.followUpTotalSec,null);
    assert.equal(result.wholeVerificationSec,null);
  }
});

test('positive-weight unknown time propagates, zero-weight unknown does not, subtotal is not total', () => {
  const result = summarizeEnquiryScenario({id:'mixed',cohorts:[cohort('known',3,true,false,7),cohort('unknown',2,false,true,null)]});
  assert.equal(result.knownFirstEnquirySubtotalSec,21); assert.equal(result.unknownFirstEnquiryCaseCount,2);
  assert.equal(result.firstEnquiryTotalSec,null);
  const zero = summarizeEnquiryScenario({id:'zero',cohorts:[cohort('known',2,true,false,0),cohort('absent',0,true,true,null)]});
  assert.equal(zero.firstEnquiryTotalSec,0); assert.equal(zero.unknownFirstEnquiryCaseCount,0);
  assert.equal(summarizeEnquiryScenario({id:'empty',cohorts:[]}).firstEnquiryTotalSec,0);
  const changed = structuredClone(b); changed.cohorts[1]!.answer.enquiryDurationSec=null;
  assert.equal(compareEnquiryScenarios(a,changed,meta).firstEnquiryDifferenceBMinusASec,null);
});

test('unequal workloads are explicit; results and inputs own their data', () => {
  const input = structuredClone(a), before = structuredClone(input);
  const run = compareEnquiryScenarios(input,{id:'small',cohorts:[cohort('only',1,true,false,2)]},meta);
  assert.equal(run.sameCaseCount,false); assert.deepEqual(input,before);
  input.cohorts[0]!.count=999; input.cohorts[0]!.answer.enquiryDurationSec=55;
  assert.equal(run.inputs[0].cohorts[0]!.count,6); assert.equal(run.results[0].firstEnquiryTotalSec,100);
});

test('reject invalid weights, duplicates, excessive work and field reports even at zero weight', () => {
  for (const count of [-1,0.5,NaN,5001]) assert.throws(()=>summarizeEnquiryScenario({id:'A',cohorts:[cohort('bad',count,true,false,1)]}));
  assert.throws(()=>summarizeEnquiryScenario({id:'A',cohorts:[cohort('same',1,true,false,1),cohort('same',1,true,false,1)]}));
  assert.throws(()=>summarizeEnquiryScenario({id:'A',cohorts:[cohort('a',3000,true,false,1),cohort('b',3000,true,false,1)]}),RangeError);
  assert.throws(()=>summarizeEnquiryScenario({id:'A',cohorts:Array.from({length:51},(_,i)=>cohort(`c${i}`,0,true,false,1))}));
  const empirical = cohort('field',0,true,false,1);
  Object.assign(empirical.answer,{provenance:'user-reported-direct-performance'});
  assert.throws(()=>summarizeEnquiryScenario({id:'A',cohorts:[empirical]}),TypeError);
  assert.throws(()=>compareEnquiryScenarios(a,a,meta),TypeError);
  assert.throws(()=>compareEnquiryScenarios(a,b,{...meta,generatedAt:'not-a-date'}),TypeError);
});

test('JSON and CSV preserve raw weighted inputs, unknowns, rules and reproducible source metadata', () => {
  const changed = structuredClone(b); changed.cohorts[2]!.answer.enquiryDurationSec=null;
  const run = compareEnquiryScenarios(a,changed,{...meta,sourceRevision:'=SUM(1,2)"\nsource'});
  const parsed = JSON.parse(enquiryJsonExport(run));
  assert.deepEqual(parsed.inputs,run.inputs); assert.equal(parsed.results[1].firstEnquiryTotalSec,null);
  assert.equal(parsed.provenance,'synthetic'); assert.equal(parsed.ruleSources.length,4);
  assert.deepEqual(compareEnquiryScenarios(parsed.inputs[0],parsed.inputs[1],meta).results,run.results);
  const csv = enquiryCsvExport(run);
  assert.ok(csv.includes('"unknown"')); assert.ok(csv.includes('"\'=SUM(1,2)""\nsource"'));
  assert.ok(csv.includes('"summary"')); assert.ok(csv.includes('"cohort"'));
  assert.ok(csv.includes('"not-established"')); assert.ok(csv.includes(run.modelVersion));
  const rows=parseCsv(csv), header=rows[0]!;
  assert.equal(header.length,31); assert.equal(rows.length,9);
  assert.ok(rows.slice(1).every(row=>row.length===header.length));
  const summaryB=rows.find(row=>row[0]==='summary'&&row[header.indexOf('scenario')]==='B')!;
  assert.equal(summaryB[header.indexOf('first_enquiry_total_sec')],'unknown');
  assert.equal(summaryB[header.indexOf('follow_up_cases')],'6');
  assert.equal(summaryB[header.indexOf('source_revision')],"'"+run.sourceRevision);
  assert.equal(summaryB[header.indexOf('whole_verification_sec')],'unknown');
  const empty = compareEnquiryScenarios({id:'emptyA',cohorts:[]},{id:'emptyB',cohorts:[]},meta);
  assert.equal(enquiryCsvExport(empty).trim().split('\r\n').length,3);
});

test('preknown cases skip enquiries while all three outcome counts conserve the same workload', () => {
  for (let known=0;known<=6;known++) {
    const changed=structuredClone(a); changed.id='prior'; changed.cohorts[0]!.count-=known;
    changed.priorKnown={count:known,provenance:'synthetic',informationSource:'checker-prior-authorization'};
    const run=compareEnquiryScenarios(a,changed,meta), result=run.results[1];
    assert.equal(result.caseCount,10); assert.equal(result.priorKnownCaseCount,known);
    assert.equal(result.priorKnownCaseCount+result.closedOnPeerReport+result.followUpCaseCount,10);
    assert.equal(result.followUpCaseCount,4); assert.equal(result.firstEnquiryCount,10-known);
    assert.equal(result.firstEnquiryTotalSec,(10-known)*10);
    assert.equal(run.firstEnquiryCountDifferenceBMinusA,0-known);
    assert.equal(run.firstEnquiryDifferenceBMinusASec,0-known*10);
    assert.equal(result.priorInformationCostSec,null); assert.equal(result.wholeVerificationSec,null);
  }
});

test('all preknown with unknown unasked time gives zero enquiries, not zero whole-process cost', () => {
  const result=summarizeEnquiryScenario({id:'known',priorKnown:{count:5000,provenance:'synthetic',informationSource:'checker-prior-authorization'},
    cohorts:[cohort('unused',0,false,true,null)]});
  assert.equal(result.caseCount,5000); assert.equal(result.firstEnquiryCount,0);
  assert.equal(result.unknownFirstEnquiryCaseCount,0); assert.equal(result.firstEnquiryTotalSec,0);
  assert.equal(result.priorKnowledgeSource,'checker-prior-authorization');
  assert.equal(result.priorInformationCostSec,null); assert.equal(result.wholeVerificationSec,null);
});

test('preknown input validates provenance/source and shares the total case bound', () => {
  const good={count:3,provenance:'synthetic',informationSource:'checker-prior-authorization'};
  for(const priorKnown of [null,{...good,count:-1},{...good,count:0.5},{...good,count:5001},
    {...good,provenance:'observed'},{...good,informationSource:undefined},{...good,informationSource:'peer-report'}]) {
    const value=structuredClone(a); Object.assign(value,{priorKnown});
    assert.throws(()=>summarizeEnquiryScenario(value),TypeError);
  }
  const excess=structuredClone(a); excess.priorKnown={count:5000,provenance:'synthetic',informationSource:'checker-prior-authorization'};
  assert.throws(()=>summarizeEnquiryScenario(excess),RangeError);
});

test('v2 exports preserve prior-information source, skipped enquiry counts and unknown information cost', () => {
  const changed=structuredClone(a); changed.id='prior'; changed.cohorts[0]!.count=3;
  changed.priorKnown={count:3,provenance:'synthetic',informationSource:'checker-prior-authorization'};
  const run=compareEnquiryScenarios(a,changed,meta);
  changed.priorKnown.count=4;
  const restored=JSON.parse(enquiryJsonExport(run));
  assert.equal(restored.schemaVersion,2); assert.equal(restored.inputs[1].priorKnown.count,3);
  assert.deepEqual(compareEnquiryScenarios(restored.inputs[0],restored.inputs[1],meta).results,run.results);
  const rows=parseCsv(enquiryCsvExport(run)),head=rows[0]!;
  assert.ok(rows.slice(1).every(row=>row.length===head.length));
  const prior=rows.find(row=>row[0]==='prior-known')!;
  assert.equal(prior[head.indexOf('case_count')],'3');
  assert.equal(prior[head.indexOf('prior_information_source')],'checker-prior-authorization');
  assert.equal(prior[head.indexOf('first_enquiry_count')],'7');
  assert.equal(prior[head.indexOf('prior_information_cost_sec')],'unknown');
  assert.equal(prior[head.indexOf('independent_verification')],'not-established');
});
