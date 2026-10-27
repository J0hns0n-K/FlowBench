import { LOCKED_GROUPS, DEFAULT_CONFIG, generateGroups } from './scenario.ts';
import type { GeneratorConfig } from './scenario.ts';
import { MODEL_VERSION, compareWorkflows } from './workflow.ts';
import type { Group, Comparison, WorkflowResult } from './workflow.ts';
import { makeExperiment, jsonExport, csvExport } from './export.ts';
import type { Experiment } from './export.ts';
import { summarizePeerTiming } from './observed.ts';

function element<T extends HTMLElement>(id: string): T {
  const value=document.getElementById(id);
  if(!value)throw new Error(`Missing element ${id}`);
  return value as T;
}
const form=element<HTMLFormElement>('scenario-form');
const source=element<HTMLSelectElement>('input-source');
const fieldset=element<HTMLFieldSetElement>('generator-fields');
const status=element('run-status'), error=element('error');
const jsonButton=element<HTMLButtonElement>('export-json'), csvButton=element<HTMLButtonElement>('export-csv');
let groups:Group[]=LOCKED_GROUPS.map(group=>({...group}));
let experiment:Experiment|null=null;
let sourceRevision='unavailable-source-revision';
let currentGenerator:GeneratorConfig|null=null;
const number=(id:string)=>element<HTMLInputElement>(id).valueAsNumber;
const fmt=(value:number,digits=value>0&&value<1?3:1)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:digits}).format(value);
const percent=(value:number)=>`${fmt(value*100,1)}%`;

function duration(value:number):string{
  const minutes=Math.floor(value/60), seconds=value%60;
  return minutes?`${minutes}분 ${fmt(seconds)}초`:`${fmt(seconds)}초`;
}

async function loadObservedBaseline():Promise<void>{
  try{
    const response=await fetch('/data/peer-timed-baseline-2026-10-27.json');
    if(!response.ok)throw new Error('기준선 파일을 읽지 못했습니다.');
    const baseline=summarizePeerTiming(await response.json());
    element('baseline-summary').innerHTML=[
      ['착석 구간',duration(baseline.seatingSec),`${baseline.seatingSec}초 · 보고된 값`],
      ['반별 확인·보고 합',duration(baseline.verificationSec),`${baseline.groupCount}개 반의 구간 합계`],
      ['착석 포함 구간 합',duration(baseline.reportedPhaseSumSec),'연속 기록 여부는 별도 확인 필요'],
    ].map(([title,value,note])=>`<div class="baseline-stat"><span>${title}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
    const maxTurn=Math.max(...baseline.rows.map(row=>row.turnSec));
    element('baseline-table').innerHTML=baseline.rows.map(row=>`<tr><td>${row.group}</td><td>${row.rosterCount}명</td><td><div class="baseline-duration"><span>${row.turnSec}초</span><span class="baseline-bar" aria-hidden="true"><i style="width:${row.turnSec/maxTurn*100}%"></i></span></div></td><td>${row.cumulativeVerificationSec}초</td></tr>`).join('');
    element('baseline-note').textContent=`명단 ${baseline.targetRosterCount}명 · 실제 당일 출석 인원은 미확인. 누적값은 구간의 산술 합이며, 시계 시각이나 대안 예측이 아닙니다.`;
  }catch{
    element('baseline-summary').textContent='기준선 표시를 완료하지 못했습니다.';
    element('baseline-error').textContent='현장 보고 데이터를 읽거나 검증하지 못했습니다. 아래 합성 실험을 현장 자료로 해석하지 마세요.';
    element('baseline-error').hidden=false;
  }
}

function markDirty():void{
  jsonButton.disabled=true;csvButton.disabled=true;
  status.textContent='입력 변경됨 · 시뮬레이션을 다시 실행하세요.';
  status.classList.add('dirty');
}
function clearError():void{error.hidden=true;error.textContent='';}
function fail(cause:unknown):void{
  const message=cause instanceof Error?cause.message:String(cause);
  error.textContent=message==='Minimum duration cannot exceed maximum duration.'?
    '최소 작업시간은 최대 작업시간보다 클 수 없습니다. 입력 범위를 확인하세요.':message;
  error.hidden=false;markDirty();
}

function config():GeneratorConfig{
  return {seed:number('seed'),groups:number('group-count'),countMinSec:number('count-min'),
    countMaxSec:number('count-max'),reportMinSec:number('report-min'),reportMaxSec:number('report-max')};
}
function label():string{
  return source.value==='locked'?'ADR-002 사전등록 합성 예제 v1':
    source.value==='generated'?'시드 기반 합성 입력':'직접 편집한 합성 입력';
}
function updateSource():void{
  fieldset.disabled=source.value!=='generated';
  element('source-note').textContent=source.value==='locked'?'6개 익명 그룹 · 고정 작업시간. 실제 학교 자료가 아닙니다.':
    source.value==='generated'?'범위 내 균등분포로 생성합니다. 실제 학교의 분포가 아닙니다.':
    '직접 바꾼 숫자도 합성 입력입니다. 실측 자료로 분류되지 않습니다.';
}

function renderMetrics(comparison:Comparison):void{
  const baseline=comparison.baseline.metrics,candidate=comparison.candidate.metrics;
  element('serial-total').innerHTML=`${fmt(baseline.totalSec)}<small>초</small>`;
  element('parallel-total').innerHTML=`${fmt(candidate.totalSec)}<small>초</small>`;
  element('difference').textContent=comparison.savedFraction===null?'비교할 그룹이 없습니다.':
    `가정 B의 완료시간이 ${fmt(comparison.savedSec)}초 짧음 · ${percent(comparison.savedFraction)}`;
  element('metrics').innerHTML=[
    ['P95 보고 대기 · 가정 B',`${fmt(candidate.p95ReportWaitSec)}<small>초</small>`,`평균 ${fmt(candidate.meanReportWaitSec)}초 · 학생 입실 대기 아님`],
    ['보고 담당자 가동 비율',`${fmt(candidate.reportBusyFraction*100)}<small>%</small>`,'시작부터 최종 보고까지의 시간 기준'],
    ['목표 이후 보고 · 가정 B',`${candidate.beyondTarget}<small>/ ${candidate.groups}그룹</small>`,`${percent(candidate.beyondTargetFraction)} · 지각 학생 비율 아님`],
  ].map(([title,value,detail])=>`<div class="metric"><div class="metric-label">${title}</div><div class="metric-number">${value}</div><div class="metric-detail">${detail}</div></div>`).join('');
}

function renderTimeline(comparison:Comparison,targetSec:number):void{
  const shown=Math.min(groups.length,10),width=760,left=56,right=24,plot=width-left-right,row=19;
  const maxTime=Math.max(1,comparison.baseline.metrics.totalSec,comparison.candidate.metrics.totalSec,targetSec);
  const scale=(value:number)=>left+value/maxTime*plot;
  const laneHeight=shown*row+37,height=laneHeight*2+40;
  const content:string[]=[`<svg class="timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="timeline-svg-title timeline-svg-desc"><title id="timeline-svg-title">순차 확인과 동시 확인의 합성 작업 타임라인</title><desc id="timeline-svg-desc">두 시나리오의 시간축은 같습니다. 확인, 보고 대기, 보고 구간을 구분합니다. 정확한 숫자는 아래 입력 표와 내보내기 파일에서 확인할 수 있습니다.</desc>`];
  for(let tick=0;tick<=4;tick++){
    const time=maxTime*tick/4,x=scale(time);
    content.push(`<line x1="${x}" x2="${x}" y1="25" y2="${height-24}" class="grid"/><text x="${x}" y="${height-7}" text-anchor="middle" class="axis-label">${fmt(time,maxTime<1?4:maxTime<10?2:0)}</text>`);
  }
  for(const [index,result] of [comparison.baseline,comparison.candidate].entries()){
    const origin=6+index*laneHeight;
    content.push(`<text x="3" y="${origin+10}" class="lane-title">${index===0?'A · 순차 확인':'B · 동시 확인'}</text>`);
    result.events.slice(0,shown).forEach((event,i)=>{
      const y=origin+23+i*row;
      content.push(`<text x="3" y="${y+10}" class="group-label">${event.id}</text><rect x="${left}" y="${y}" width="${plot}" height="11" rx="2" class="track"/>`);
      const segment=(start:number,end:number,kind:string)=>{
        if(end>start)content.push(`<rect x="${scale(start)}" y="${y}" width="${(end-start)/maxTime*plot}" height="11" rx="1" class="${kind}"/>`);
      };
      segment(event.countStartSec,event.countEndSec,'count');
      segment(event.countEndSec,event.reportStartSec,'wait');
      segment(event.reportStartSec,event.reportEndSec,'report');
    });
  }
  content.push(`<line x1="${scale(targetSec)}" x2="${scale(targetSec)}" y1="24" y2="${height-24}" class="target-line"/></svg>`);
  element('timeline').innerHTML=content.join('');
  element('timeline-note').textContent=groups.length>shown?`가독성을 위해 ${groups.length}개 중 앞 ${shown}개 그룹만 표시합니다. 전체 이벤트는 표와 내보내기 파일에 포함됩니다.`:
    '동시 확인에서는 확인이 끝나도 앞선 보고가 진행 중이면 기다립니다. 황색 구간이 보고 대기입니다.';
}

function renderInputs(candidate:WorkflowResult):void{
  element('input-table').innerHTML=candidate.events.map((event,index)=>`<tr><td>${event.id}</td><td><input type="number" data-index="${index}" data-field="countSec" min="0.001" max="3600" step="0.001" value="${event.countSec}" aria-label="${event.id} 확인시간 (초)" required></td><td><input type="number" data-index="${index}" data-field="reportSec" min="0.001" max="3600" step="0.001" value="${event.reportSec}" aria-label="${event.id} 보고시간 (초)" required></td><td>${fmt(event.reportWaitSec)}초</td><td>${fmt(event.reportEndSec)}초</td></tr>`).join('');
}

function renderSensitivity(targetSec:number):void{
  element('sensitivity').innerHTML=[0.5,1,2,4].map(multiplier=>{
    const comparison=compareWorkflows(groups.map(group=>({...group,reportSec:group.reportSec*multiplier})),targetSec);
    const pass=comparison.candidate.metrics.p95ReportWaitSec<=30;
    return `<tr><td>× ${multiplier}</td><td>${fmt(comparison.baseline.metrics.totalSec)}초</td><td>${fmt(comparison.candidate.metrics.totalSec)}초</td><td>${fmt(comparison.candidate.metrics.p95ReportWaitSec)}초</td><td class="${pass?'pass':'fail'}">${pass?'충족':'미충족'}</td></tr>`;
  }).join('');
}

function run():void{
  clearError();
  try{
    if(!form.reportValidity())return;
    if(source.value==='locked'){groups=LOCKED_GROUPS.map(group=>({...group}));currentGenerator=null;}
    else if(source.value==='generated'){currentGenerator=config();groups=generateGroups(currentGenerator);}
    else{
      for(const input of element('input-table').querySelectorAll<HTMLInputElement>('input')){
        if(!input.reportValidity())throw new Error('합성 작업시간은 0.001~3600초 사이로 입력하세요.');
        const group=groups[Number(input.dataset.index)]!;
        if(input.dataset.field==='countSec')group.countSec=input.valueAsNumber;
        else group.reportSec=input.valueAsNumber;
      }
      currentGenerator=null;
    }
    const targetSec=number('target');
    const next=makeExperiment(groups,targetSec,{sourceRevision,generatedAt:new Date().toISOString(),
      generator:currentGenerator,inputLabel:label()});
    renderMetrics(next.comparison);renderTimeline(next.comparison,targetSec);
    renderInputs(next.comparison.candidate);renderSensitivity(targetSec);
    experiment=next;
    status.textContent=`${groups.length}개 합성 그룹 실행 완료 · 두 절차에 동일 입력 사용`;
    status.classList.remove('dirty');jsonButton.disabled=false;csvButton.disabled=false;
  }catch(cause){fail(cause);}
}

function download(format:'json'|'csv'):void{
  if(!experiment)return;
  const blob=new Blob([format==='json'?jsonExport(experiment):csvExport(experiment)],
    {type:format==='json'?'application/json;charset=utf-8':'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=`flowbench-synthetic-${new Date().toISOString().replaceAll(':','-')}.${format}`;
  anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent=`${format.toUpperCase()} 파일을 내보냈습니다 · 합성 데이터와 가정 포함`;
}

form.addEventListener('submit',event=>{event.preventDefault();run();});
form.addEventListener('input',()=>{clearError();markDirty();});
source.addEventListener('change',()=>{updateSource();markDirty();});
element('input-table').addEventListener('input',()=>{
  const custom=source.querySelector<HTMLOptionElement>('option[value="custom"]')!;
  custom.disabled=false;source.value='custom';updateSource();clearError();markDirty();
});
element('reset-scenario').addEventListener('click',()=>{
  form.reset();source.value='locked';source.querySelector<HTMLOptionElement>('option[value="custom"]')!.disabled=true;
  updateSource();run();
});
jsonButton.addEventListener('click',()=>download('json'));
csvButton.addEventListener('click',()=>download('csv'));

async function initialize():Promise<void>{
  try{
    const response=await fetch('/source-meta.json');
    if(response.ok){const meta:unknown=await response.json();
      if(meta&&typeof meta==='object'&&'sourceRevision' in meta&&typeof meta.sourceRevision==='string')sourceRevision=meta.sourceRevision;
    }
  }catch{/* Source unavailability is explicit in exports; computation remains browser-local. */}
  element('source-revision').textContent=`${MODEL_VERSION} · 소스 ${sourceRevision.slice(0,12)}${sourceRevision.includes('+dirty')?' (수정 중)':''}`;
  // Restore known defaults even if a browser restores form values from an earlier visit.
  element<HTMLInputElement>('seed').value=String(DEFAULT_CONFIG.seed);
  source.value='locked';updateSource();run();
  await loadObservedBaseline();
}
void initialize();
