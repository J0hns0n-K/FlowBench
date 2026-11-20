import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {evaluateEnquiryTrace} from '../src/enquiry-trace.ts';
import {replayEnquiryTrace} from '../src/enquiry-trace-replay.ts';
import {enquiryTraceCsv} from '../src/enquiry-trace-csv.ts';

const args=process.argv.slice(2);
assert.ok(args.length===0||(args.length===1&&args[0]==='--write'),'Use no arguments or --write.');
const fixturePath='data/enquiry-trace-fixtures-v1.json', artifactPath='experiments/2026-11-20-enquiry-traces-v1.json';
const fixture=JSON.parse(await readFile(fixturePath,'utf8'));
assert.equal(fixture.schemaVersion,1);assert.equal(fixture.provenance,'synthetic');
assert.equal(fixture.construction,'assistant-constructed-post-implementation-fixtures');
assert.equal(fixture.cases.length,8);assert.equal(new Set(fixture.cases.map(item=>item.id)).size,8);
const sourceFiles=['src/enquiry-trace.ts','src/inquiry-policy.ts','src/engine.ts','src/enquiry-trace-replay.ts',
  'src/enquiry-trace-csv.ts',fixturePath,'scripts/enquiry-trace-fixtures.mjs'];
const hash=createHash('sha256');
for(const file of sourceFiles){hash.update(file);hash.update((await readFile(file,'utf8')).replaceAll('\r\n','\n'));}
const sourceFingerprint=hash.digest('hex');
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const dirty=execFileSync('git',['status','--porcelain','--',...sourceFiles],{encoding:'utf8',windowsHide:true}).trim().length>0;
const currentMeta={generatedAt:new Date().toISOString(),sourceRevision:revision+(dirty?`+dirty:${sourceFingerprint.slice(0,12)}`:''),sourceFingerprint};
const saved=args[0]==='--write'?null:JSON.parse(await readFile(artifactPath,'utf8'));
const metadata=saved?{generatedAt:saved.generatedAt,sourceRevision:saved.sourceRevision,sourceFingerprint:saved.sourceFingerprint}:currentMeta;
assert.equal(metadata.sourceFingerprint,sourceFingerprint,'Evidence source fingerprint is stale.');
assert.equal(new Date(metadata.generatedAt).toISOString(),metadata.generatedAt);
assert.match(metadata.sourceRevision,/^[a-f0-9]{40}(?:\+dirty:[a-f0-9]{12})?$/);

const cases=fixture.cases.map(item=>{
  assert.match(item.id,/^[a-z0-9-]+$/);
  const contacts=item.contactRefs.map(key=>{assert.ok(Object.hasOwn(fixture.contacts,key),'Unknown fixture contact reference.');return {...fixture.contacts[key]};});
  const record={...evaluateEnquiryTrace({provenance:'synthetic',priorInformation:item.priorInformation,contacts}),...metadata};
  for(const [key,value] of Object.entries(item.expected))assert.deepEqual(record[key],value,`${item.id}: ${key}`);
  assert.equal(record.contactCount,contacts.length);assert.equal(record.wholeVerificationSec,null);
  assert.equal(record.priorInformationCostSec,null);assert.equal(record.independentVerification,'not-established');
  assert.equal(replayEnquiryTrace(JSON.stringify(record)).matchesStoredCalculation,true);
  const csv=enquiryTraceCsv(record), [header,...lines]=csv.trimEnd().split('\r\n'),keys=header.split(',');
  assert.equal(keys.length,34);assert.equal(lines.length,contacts.length+1);
  const rows=lines.map(line=>{
    const cells=[...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(match=>JSON.parse(match[1].replaceAll('""','"')));
    assert.equal(cells.length,keys.length);return Object.fromEntries(keys.map((key,i)=>[key,cells[i]]));
  });
  assert.equal(rows[0].record_type,'summary');assert.deepEqual(evaluateEnquiryTrace(rows[0].input),evaluateEnquiryTrace(record.input));
  assert.equal(rows[0].enquiry_total_sec,record.enquiryTotalSec);
  assert.equal(rows[0].known_enquiry_subtotal_sec,record.knownEnquirySubtotalSec);
  for(const [index,event] of record.events.entries()){
    const row=rows[index+1];assert.equal(row.record_type,'contact');assert.equal(row.contact_id,event.contact.id);
    assert.equal(row.enquiry_duration_sec,event.contact.enquiryDurationSec);assert.equal(row.start_offset_sec,event.startOffsetSec);
    assert.equal(row.end_offset_sec,event.endOffsetSec);assert.equal(row.state_after,event.stateAfter);
  }
  return {id:item.id,expected:item.expected,record,csv};
});
const bundle={schemaVersion:1,evaluationVersion:'enquiry-trace-fixtures-v1',provenance:'synthetic',construction:fixture.construction,
  ...metadata,sourceFiles,fixturePath,cases,empiricalAccuracy:null,sourceAuthenticity:'not-verified',limitations:fixture.limitations};
if(args[0]==='--write'){await mkdir('experiments',{recursive:true});await writeFile(artifactPath,JSON.stringify(bundle,null,2)+'\n');}
else assert.deepEqual(saved,bundle,'Saved JSON/CSV evidence differs from recalculation; review before --write.');
console.log(JSON.stringify({checkedAgainstSaved:args.length===0,sourceRevision:currentMeta.sourceRevision,sourceFingerprint,
  caseCount:cases.length,cases:cases.map(({id,record})=>({id,state:record.finalState,totalSec:record.enquiryTotalSec,
    knownSubtotalSec:record.knownEnquirySubtotalSec,csvRows:record.contactCount+1})),empiricalAccuracy:null},null,2));
