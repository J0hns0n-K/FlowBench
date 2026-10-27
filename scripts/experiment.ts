import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { LOCKED_GROUPS } from '../src/scenario.ts';
import { compareWorkflows, MODEL_VERSION } from '../src/workflow.ts';
import { makeExperiment } from '../src/export.ts';

const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const dirty=execFileSync('git',['status','--porcelain','--','src','scripts/experiment.ts','package.json','pnpm-lock.yaml'],
  {encoding:'utf8',windowsHide:true}).trim().length>0;
const sourceRevision=revision+(dirty?'+dirty':'');
const generatedAt=new Date().toISOString();
const experiment=makeExperiment(LOCKED_GROUPS,120,{sourceRevision,generatedAt,generator:null,inputLabel:'ADR-002 locked fixture v1'});
const candidate=experiment.comparison.candidate.metrics;
const sensitivity=[0.5,1,2,4].map(multiplier=>{
  const groups=LOCKED_GROUPS.map(g=>({...g,reportSec:g.reportSec*multiplier}));
  const comparison=compareWorkflows(groups,120);
  return {multiplier,inputs:groups,comparison,
    H1:comparison.savedFraction!>=0.30?'supported-for-this-fixture':'rejected-for-this-fixture',
    H2:comparison.candidate.metrics.p95ReportWaitSec<=30?'supported-for-this-fixture':'rejected-for-this-fixture'};
});
const counterexampleInputs=Array.from({length:6},(_,i)=>({id:`G${i+1}`,countSec:1,reportSec:60}));
const counterexample=compareWorkflows(counterexampleInputs,120);
const result={schemaVersion:1,modelVersion:MODEL_VERSION,sourceRevision,generatedAt,provenance:'synthetic',units:'seconds',
  experiment,hypotheses:{H1:experiment.comparison.savedFraction!>=0.30,H2:candidate.p95ReportWaitSec<=30},
  sensitivity,counterexample:{inputs:counterexampleInputs,comparison:counterexample,
    H1:counterexample.savedFraction!>=0.30,H2:counterexample.candidate.metrics.p95ReportWaitSec<=30},
  interpretation:'Synthetic model verification only. No measured school improvement, statistical confidence or student authorship claim.'};
await mkdir('experiments',{recursive:true});
await writeFile('experiments/2026-10-27-synthetic-v1.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({sourceRevision,synthetic:true,baselineSec:experiment.comparison.baseline.metrics.totalSec,
  candidateSec:candidate.totalSec,p95ReportWaitSec:candidate.p95ReportWaitSec,hypotheses:result.hypotheses,
  sensitivity:sensitivity.map(x=>({multiplier:x.multiplier,totalSec:x.comparison.candidate.metrics.totalSec,
    p95ReportWaitSec:x.comparison.candidate.metrics.p95ReportWaitSec,H1:x.H1,H2:x.H2})),
  counterexampleSavedFraction:counterexample.savedFraction},null,2));
