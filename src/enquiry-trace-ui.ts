import { evaluateEnquiryTrace, MAX_TRACE_CONTACTS } from './enquiry-trace.ts';
import { replayEnquiryTrace } from './enquiry-trace-replay.ts';
import type { TraceContact, TraceState } from './enquiry-trace.ts';

export function initializeEnquiryTrace(metadata:{sourceRevision:string|null;sourceFingerprint:string|null}):void {
  const get=<T extends HTMLElement>(id:string):T=>document.getElementById(id) as T;
  const form=get<HTMLFormElement>('trace-form'), rows=get('trace-contacts');
  const prior=get<HTMLSelectElement>('trace-prior'), result=get('trace-result');
  const preview=get<HTMLTextAreaElement>('trace-preview'), show=get<HTMLButtonElement>('trace-json');
  const add=get<HTMLButtonElement>('trace-add'), remove=get<HTMLButtonElement>('trace-remove');
  const states:Record<TraceState,string>={
    'not-started':'문의 시작 전','skipped-on-prior-information':'사전 정보로 질문 생략',
    'closed-on-peer-report':'첫 친구 제보로 종료','follow-up-required':'후속 문의 필요 / 계속 기록',
    'reported-stop-after-follow-up':'후속 단계에서 종료했다고 기록','follow-up-disposition-unknown':'후속 종료 판단 미기록',
  };
  let record:unknown=null;
  const invalidate=()=>{record=null;result.hidden=true;preview.value='';preview.hidden=true;show.disabled=true;
    get('trace-replay-status').textContent='';
    get('trace-error').hidden=true;get('trace-status').textContent='입력이 바뀌었습니다. 경로 계산을 눌러 주세요.';};
  const read=():TraceContact[]=>Array.from(rows.querySelectorAll('fieldset')).map((row,index)=>{
    const field=(name:string)=>row.querySelector<HTMLInputElement|HTMLSelectElement>(`[data-field="${name}"]`)!;
    const time=field('time').value;
    return {id:row.dataset.contactId!,target:field('target').value as TraceContact['target'],
      specificDestinationReported:field('specific').value==='yes',uncertaintyReported:field('uncertain').value==='yes',
      enquiryDurationSec:time.trim()===''?null:Number(time),
      followUpDisposition:index===0?null:field('disposition').value as TraceContact['followUpDisposition']};
  });
  const paint=(contacts:TraceContact[])=>{
    rows.replaceChildren();
    contacts.forEach((contact,index)=>{
      const row=document.createElement('fieldset'), legend=document.createElement('legend');
      row.dataset.contactId=contact.id;
      legend.textContent=`가상 문의 ${index+1}`;row.append(legend);
      const select=(key:string,label:string,options:readonly (readonly [string,string])[],value:string)=>{
        const wrapper=document.createElement('label');wrapper.textContent=label;
        const control=document.createElement('select');control.dataset.field=key;
        for(const [value,text] of options){const option=document.createElement('option');option.value=value;option.textContent=text;control.append(option);}
        control.value=value;wrapper.append(control);row.append(wrapper);return control;
      };
      const target=select('target','문의 대상',[['peer','친구·동급생'],['leader','리더'],['dormitory-supervisor','사감쌤'],['principal','교장쌤']],contact.target);
      target.disabled=index===0;
      select('specific','구체적인 행선지 전달',[['yes','예'],['no','아니요']],contact.specificDestinationReported?'yes':'no');
      select('uncertain','잘 모르는 상태 표시',[['yes','예'],['no','아니요']],contact.uncertaintyReported?'yes':'no');
      const label=document.createElement('label');label.textContent='문의 구간 시간 (초 · 모르면 빈칸)';
      const time=document.createElement('input');time.type='number';time.min='0';time.max='86400';time.step='any';
      time.dataset.field='time';time.value=contact.enquiryDurationSec===null?'':String(contact.enquiryDurationSec);label.append(time);row.append(label);
      if(index>0)select('disposition','후속 단계의 판단 기록',[['not-recorded','판단 미기록'],['continue','계속 문의'],['reported-stop','종료했다고 기록']],contact.followUpDisposition!);
      rows.append(row);
    });
    sync();invalidate();
  };
  const sync=()=>{
    const skipped=prior.value==='checker-prior-authorization';
    for(const row of rows.querySelectorAll('fieldset'))row.disabled=skipped;
    add.disabled=skipped||rows.children.length>=MAX_TRACE_CONTACTS;remove.disabled=skipped||rows.children.length===0;
  };
  const peer=(specific=false):TraceContact=>({id:'C1',target:'peer',specificDestinationReported:specific,
    uncertaintyReported:!specific,enquiryDurationSec:10,followUpDisposition:null});
  const later=(time:number|null=20,disposition:TraceContact['followUpDisposition']='not-recorded'):TraceContact=>({
    id:'C2',target:'leader',specificDestinationReported:true,uncertaintyReported:false,enquiryDurationSec:time,followUpDisposition:disposition});
  const execute=()=>{
    invalidate();if(!form.reportValidity())return;
    try{
      const run=evaluateEnquiryTrace({provenance:'synthetic',priorInformation:prior.value,
        contacts:prior.value==='checker-prior-authorization'?[]:read()});
      get('trace-state').textContent=states[run.finalState];
      const sec=(value:number|null)=>value===null?'미확인':`${value}초`;
      get('trace-time').textContent=`문의 ${run.contactCount}건 · 문의 구간 합 ${sec(run.enquiryTotalSec)} · 알려진 소계 ${sec(run.knownEnquirySubtotalSec)} · 시간 미확인 ${run.unknownDurationCount}건`;
      const maximum=Math.max(0,...run.events.map(event=>event.contact.enquiryDurationSec??0));
      const targets={peer:'친구·동급생',leader:'리더','dormitory-supervisor':'사감쌤',principal:'교장쌤'};
      const bars=get('trace-duration-bars');
      bars.replaceChildren(...run.events.map(({contact})=>{
        const row=document.createElement('div');row.className='trace-duration-row';row.setAttribute('role','listitem');
        const label=document.createElement('span');label.textContent=`${contact.id} · ${targets[contact.target]}`;
        const track=document.createElement('div');track.className='trace-duration-track';track.setAttribute('aria-hidden','true');
        if(contact.enquiryDurationSec===null){track.classList.add('unknown');track.textContent='길이 미확인';}
        else{const bar=document.createElement('span');bar.style.width=`${maximum?100*contact.enquiryDurationSec/maximum:0}%`;track.append(bar);}
        const value=document.createElement('strong');value.textContent=sec(contact.enquiryDurationSec);
        row.append(label,track,value);return row;
      }));
      get('trace-duration-note').textContent=run.contactCount===0?'문의 구간이 없어 막대를 표시하지 않습니다. 정보 비용과 전체 확인시간은 여전히 미확인입니다.':
        maximum===0?'알려진 양의 시간이 없습니다. 0초는 막대 길이 0, 모르는 시간은 길이 미확인으로 표시합니다.':
        `막대는 각 문의 구간의 길이만 비교합니다. 가장 긴 알려진 구간은 ${maximum}초입니다. 전체 완료 시각이나 전체 시간 비율을 나타내지 않습니다.`;
      get('trace-events').replaceChildren(...run.events.map(event=>{
        const row=document.createElement('tr');
        for(const value of [event.contact.id,sec(event.startOffsetSec),sec(event.endOffsetSec),states[event.stateAfter]]){
          const cell=document.createElement('td');cell.textContent=value;row.append(cell);
        }return row;
      }));
      get('trace-status').textContent='가상 문의 경로 계산 완료';result.hidden=false;show.disabled=false;
      record={...run,generatedAt:new Date().toISOString(),...metadata};
    }catch{
      get('trace-error').textContent='종료했거나 판단이 미기록인 단계 뒤에는 문의를 붙일 수 없습니다. 앞 단계의 판단 기록과 시간 범위를 확인하세요.';
      get('trace-error').hidden=false;get('trace-status').textContent='입력 경로를 확인해 주세요.';
    }
  };
  form.addEventListener('input',invalidate);
  prior.addEventListener('change',()=>{sync();invalidate();});
  form.addEventListener('submit',event=>{event.preventDefault();execute();});
  add.addEventListener('click',()=>{const contacts=read();if(contacts.length<MAX_TRACE_CONTACTS){
    let next=1;while(contacts.some(contact=>contact.id===`C${next}`))next++;
    paint([...contacts,{...(contacts.length?later():peer()),id:`C${next}`}]);
  }});
  remove.addEventListener('click',()=>paint(read().slice(0,-1)));
  for(const [id,contacts] of Object.entries({first:[peer(true)],missing:[peer(),later()],
    stopped:[peer(),later(20,'reported-stop')],unknown:[peer(),later(null,'continue'),{...later(7,'reported-stop'),id:'C3'}]})){
    get(`trace-example-${id}`).addEventListener('click',()=>{prior.value='none';paint(contacts);execute();});
  }
  show.addEventListener('click',()=>{if(record){preview.value=JSON.stringify(record,null,2);preview.hidden=false;}});
  const replayInput=get<HTMLTextAreaElement>('trace-replay-input'), replayStatus=get('trace-replay-status');
  replayInput.addEventListener('input',()=>{replayStatus.textContent='';});
  get('trace-replay').addEventListener('click',()=>{
    try{
      const checked=replayEnquiryTrace(replayInput.value);
      if(!checked.matchesStoredCalculation){
        replayStatus.textContent=`저장된 계산과 일치하지 않아 불러오지 않았습니다. 불일치 항목: ${checked.mismatchedFields.join(', ')}`;
        return;
      }
      prior.value=checked.recomputed.input.priorInformation;
      paint(checked.recomputed.input.contacts);execute();
      replayStatus.textContent='현재 코드의 재계산 결과와 일치해 불러왔습니다. 원본 출처나 실제 출석을 인증한 것은 아닙니다. 새 기록에는 현재 코드 버전과 생성 시각을 사용합니다.';
    }catch{
      replayStatus.textContent='불러오지 못했습니다. 지원되는 가상 문의 경로 JSON인지, 입력·버전·크기(최대 200,000자)를 확인하세요.';
    }
  });
  prior.value='none';paint([peer(),later()]);execute();
}
