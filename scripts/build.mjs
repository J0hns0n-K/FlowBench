import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],{stdio:'inherit',windowsHide:true});
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--project','tsconfig.build.json'],{stdio:'inherit',windowsHide:true});
await mkdir('dist',{recursive:true});
await Promise.all(['index.html','styles.css'].map(file=>copyFile(`public/${file}`,`dist/${file}`)));
const overview=JSON.parse(await readFile('docs/overview-state.json','utf8'));
if(!Array.isArray(overview.fieldReports)||!overview.fieldReports.length||overview.fieldReports.some(file=>typeof file!=='string'||!/^data\/[A-Za-z0-9_-]+\.json$/.test(file)))throw new Error('Invalid reviewed field-report index.');
const dataFiles=[...new Set(['data/peer-timed-baseline-2026-10-27.json','data/decoupled-attendance-decision-2026-10-27.json',...overview.fieldReports])];
await mkdir('dist/data',{recursive:true});
await Promise.all(dataFiles.map(file=>copyFile(file,`dist/${file}`)));
await copyFile('docs/overview-state.json','dist/data/field-report-index.json');
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const dirty=execFileSync('git',['status','--porcelain','--','src','public',...dataFiles,'docs/overview-state.json','scripts/build.mjs','package.json','pnpm-lock.yaml','tsconfig.json','tsconfig.build.json'],
  {encoding:'utf8',windowsHide:true}).trim().length>0;
const hash=createHash('sha256');
async function fingerprint(directory){
  for(const item of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    const file=`${directory}/${item.name}`;
    if(item.isDirectory())await fingerprint(file);
    else{hash.update(file);hash.update(await readFile(file));}
  }
}
await fingerprint('src');await fingerprint('public');
for(const file of ['package.json','pnpm-lock.yaml','tsconfig.json','tsconfig.build.json','scripts/build.mjs','docs/overview-state.json',...dataFiles]){
  hash.update(file);hash.update(await readFile(file));
}
const sourceFingerprint=hash.digest('hex');
const sourceRevision=revision+(dirty?`+dirty:${sourceFingerprint.slice(0,12)}`:'');
await writeFile('dist/source-meta.json',JSON.stringify({sourceRevision,sourceFingerprint,builtAt:new Date().toISOString()},null,2)+'\n');
console.log(`Built browser app in dist/ from ${sourceRevision}`);
