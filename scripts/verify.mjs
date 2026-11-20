import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if(process.argv.length!==2)throw new Error('Use node scripts/verify.mjs without arguments.');
if(Number(process.versions.node.split('.')[0])<24)throw new Error('Node.js 24 or newer is required.');
const root=fileURLToPath(new URL('../',import.meta.url));
const steps=[
  ['Unit tests',['--run','test']],
  ['Project overview freshness',['scripts/project-overview.mjs','--check']],
  ['Typecheck and browser build',['scripts/build.mjs']],
  ['Label/site limitation witnesses',['scripts/label-comparison-limits.mjs']],
  ['Saved enquiry trace JSON/CSV fixtures',['scripts/enquiry-trace-fixtures.mjs']],
];
let completed=0;
for(const [label,args] of steps){
  console.log(`\n[${completed+1}/${steps.length}] ${label}`);
  try{
    execFileSync(process.execPath,args,{cwd:root,stdio:'inherit',windowsHide:true});
    completed++;
  }catch(error){
    console.error(`Verification stopped: ${label}. Later checks were not run.`);
    process.exitCode=Number.isInteger(error.status)&&error.status>0?error.status:1;
    break;
  }
}
if(completed===steps.length)console.log(`\nAll ${steps.length} verification stages passed. Saved experiment records were not regenerated.`);
