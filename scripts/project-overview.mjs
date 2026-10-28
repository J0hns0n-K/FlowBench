import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { compareCommitteeObservation } from '../src/observed.ts';

const mode=process.argv[2];
if(!['--check','--write'].includes(mode)||process.argv.length!==3)throw new Error('Use --check or --write.');
const readJson=async file=>JSON.parse(await readFile(file,'utf8'));
const state=await readJson('docs/overview-state.json');
if(typeof state.baseline!=='string'||!Array.isArray(state.fieldReports)||!state.fieldReports.length||
  new Set(state.fieldReports).size!==state.fieldReports.length||typeof state.latestReportDocument!=='string'){
  throw new Error('Overview needs an explicit baseline, reviewed field reports and latest report document.');
}
const dataPaths=(await readdir('data')).filter(file=>file.endsWith('.json')).sort().map(file=>`data/${file}`);
const data=await Promise.all(dataPaths.map(async file=>({file,record:await readJson(file)})));
const direct=data.filter(({record})=>record.sourceKind==='user-reported-direct-performance').map(({file})=>file);
if(direct.some(file=>!state.fieldReports.includes(file))||state.fieldReports.some(file=>!direct.includes(file))){
  throw new Error('New or missing field report: review the narrative and docs/overview-state.json before syncing.');
}
if(!dataPaths.includes(state.baseline))throw new Error('Baseline must be an existing data record.');
if(!/^docs\/[A-Za-z0-9_-]+\.md$/.test(state.latestReportDocument))throw new Error('Invalid report document.');
await access(state.latestReportDocument);
const baseline=await readJson(state.baseline);
const reports=await Promise.all(state.fieldReports.map(readJson));
if(reports.some((record,i)=>i>0&&record.reportedOn<reports[i-1].reportedOn))throw new Error('Review report ordering.');
const latest=reports.at(-1), latestPath=state.fieldReports.at(-1);
const comparison=compareCommitteeObservation(baseline,latest);
const baselineSec=baseline.turns.reduce((sum,turn)=>sum+turn.turnSec,0);
const delta=comparison.checkingDifferenceSec;
const pct=Number((Math.abs(comparison.checkingDifferenceFraction)*100).toFixed(2));
const difference=delta===0?'The reported checking durations are equal.':
  `The latest checking duration is **${Math.abs(delta)} s (${pct}%) ${delta>0?'shorter':'longer'}** than the earlier combined-turn sum.`;
const fingerprint=createHash('sha256');
const evidenceFiles=[...dataPaths,...(await readdir('docs')).filter(file=>/\.(md|json)$/.test(file)).map(file=>`docs/${file}`),
  'scripts/project-overview.mjs','scripts/build.mjs','scripts/experiment.ts','.github/workflows/verify.yml','package.json'];
for(const directory of ['src','tests']){
  evidenceFiles.push(...(await readdir(directory)).filter(file=>file.endsWith('.ts')).map(file=>`${directory}/${file}`));
}
for(const file of [...new Set(evidenceFiles)].sort()){
  fingerprint.update(file);fingerprint.update((await readFile(file,'utf8')).replaceAll('\r\n','\n'));
}
const generated=`<!-- FLOWBENCH:CURRENT:START -->
<!-- Evidence fingerprint: ${fingerprint.digest('hex')} -->
Evidence reviewed through the latest linked report received **${latest.reportedOn}**. New-procedure reports recorded: **${reports.length}**. Report dates are not independently confirmed observation dates.

| Report | Seating | Attendance verification | Source |
| --- | --- | --- | --- |
| Earlier class-by-class procedure · received ${baseline.reportedOn} | ${baseline.seatingSec} s | ${baselineSec} s, summed across ${baseline.turns.length} class turns | [Peer timing relayed by Junmo](${state.baseline}) |
| Latest committee-check procedure · received ${latest.reportedOn} | ${latest.seatingSec} s | ${latest.verificationSec} s | [Direct performance reported by Junmo](${latestPath}) |

${difference} This is a descriptive comparison of different sessions and methods. Exceptions, timer metadata and completion boundaries remain incompletely documented; it is not a causal estimate or an average improvement.

Non-checkers reportedly began study after seating. Exact study-start latency and the checker's study start remain unknown. Junmo reports no missed students; an independently audited error rate has not been established. [Full report](${state.latestReportDocument}).
<!-- FLOWBENCH:CURRENT:END -->`;
const readme=await readFile('README.md','utf8');
const pattern=/<!-- FLOWBENCH:CURRENT:START -->[\s\S]*?<!-- FLOWBENCH:CURRENT:END -->/g;
if([...readme.matchAll(pattern)].length!==1)throw new Error('README needs exactly one current-evidence block.');
const updated=readme.replace(pattern,generated);
if(mode==='--write'){
  await writeFile('README.md',updated);console.log('Updated README evidence block. Review the surrounding narrative and contribution scope.');
}else if(updated.replaceAll('\r\n','\n')!==readme.replaceAll('\r\n','\n')){
  throw new Error('Project overview is stale. Review narrative, evidence and contributions; run pnpm docs:sync.');
}else console.log('Project overview matches reviewed evidence and engineering sources.');
