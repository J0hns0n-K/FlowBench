import { compareEnquiryScenarios, enquiryJsonExport, enquiryCsvExport } from './inquiry-scenarios.ts';
import type { EnquiryScenario, EnquiryComparison } from './inquiry-scenarios.ts';

export function initializeEnquiryComparison(sourceRevision: string): void {
  const get = <T extends HTMLElement>(id: string): T => {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Missing enquiry element ${id}`);
    return node as T;
  };
  const form = get<HTMLFormElement>('enquiry-form'), results = get('enquiry-results');
  const error = get('enquiry-error'), status = get('enquiry-status');
  const preview = get<HTMLTextAreaElement>('enquiry-preview');
  const jsonButton = get<HTMLButtonElement>('enquiry-json'), csvButton = get<HTMLButtonElement>('enquiry-csv');
  let run: EnquiryComparison | null = null;
  const format = (value: number | null) => value === null ? '미확인' : `${new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2}).format(value)}초`;
  const invalidate = () => {
    run = null; results.hidden = true; preview.hidden = true;
    get('enquiry-format-status').textContent = '';
    jsonButton.disabled = true; csvButton.disabled = true;
    status.textContent = '입력이 바뀌었습니다. 다시 비교하세요.';
    error.hidden = true;
  };
  const scenario = (id: 'A' | 'B'): EnquiryScenario => {
    const time = get<HTMLInputElement>(`enquiry-${id}-time`);
    const duration = time.value.trim() === '' ? null : time.valueAsNumber;
    const types = [
      { id:'clear', specific:true, uncertain:false },
      { id:'doubt', specific:true, uncertain:true },
      { id:'vague', specific:false, uncertain:true },
    ];
    return { id, priorKnown:{count:get<HTMLInputElement>(`enquiry-${id}-prior`).valueAsNumber,
      provenance:'synthetic',informationSource:'checker-prior-authorization'}, cohorts:types.map(type => ({id:type.id,
      count:get<HTMLInputElement>(`enquiry-${id}-${type.id}`).valueAsNumber,
      answer:{provenance:'synthetic',specificDestinationReported:type.specific,
        uncertaintyReported:type.uncertain,enquiryDurationSec:duration}})) };
  };
  const execute = () => {
    invalidate();
    if (!form.reportValidity()) return;
    try {
      const next = compareEnquiryScenarios(scenario('A'),scenario('B'),{sourceRevision,generatedAt:new Date().toISOString()});
      get('enquiry-summary').replaceChildren(...next.results.map(summary => {
        const card = document.createElement('article'); card.className = 'enquiry-result-card';
        const title = document.createElement('h3'); title.textContent = `조건 ${summary.scenarioId} · 가상 ${summary.caseCount}건`;
        const counts = document.createElement('p'); counts.className = 'enquiry-counts';
        counts.textContent = `사전 정보로 질문 생략 ${summary.priorKnownCaseCount}건 / 제보로 종료 ${summary.closedOnPeerReport}건 / 추가 문의 필요 ${summary.followUpCaseCount}건`;
        const bar = document.createElement('div'); bar.className = 'enquiry-bar'; bar.setAttribute('aria-hidden','true');
        bar.hidden = summary.caseCount === 0;
        const prior = document.createElement('span'); prior.className = 'enquiry-prior-bar';
        prior.style.width = `${summary.caseCount ? 100*summary.priorKnownCaseCount/summary.caseCount : 0}%`;
        const closed = document.createElement('span'); closed.style.width = `${summary.caseCount ? 100*summary.closedOnPeerReport/summary.caseCount : 0}%`;
        bar.append(prior,closed);
        const first = document.createElement('p'); first.textContent = `첫 문의 ${summary.firstEnquiryCount}회 · 시간 합 ${format(summary.firstEnquiryTotalSec)}`;
        const subtotal = document.createElement('p'); subtotal.className = 'field-note';
        subtotal.textContent = `알려진 시간 소계 ${format(summary.knownFirstEnquirySubtotalSec)} · 시간 미입력 ${summary.unknownFirstEnquiryCaseCount}건`;
        const unknown = document.createElement('p'); unknown.className = 'field-note';
        unknown.textContent = '사전 정보 확보·전달 비용, 추가 문의 총횟수·후속 시간·전체 확인시간: 미확인';
        card.append(title,counts,bar,first,subtotal,unknown); return card;
      }));
      get('enquiry-difference').textContent = `${next.sameCaseCount ? '같은 가상 사례 수' : '가상 사례 수가 서로 다름'} · 첫 문의 횟수 차이(B−A): ${next.firstEnquiryCountDifferenceBMinusA}회 · 첫 문의 시간 차이(B−A): ${format(next.firstEnquiryDifferenceBMinusASec)}. 사전 정보 비용과 후속 업무를 포함한 전체 차이는 미확인입니다.`;
      run = next; results.hidden = false; jsonButton.disabled = false; csvButton.disabled = false;
      status.textContent = '가상 조건 비교 완료 · 현장 개선 효과나 정확도 측정값이 아닙니다.';
    } catch (cause) {
      error.textContent = cause instanceof RangeError ? '각 조건의 가상 사례 합은 5,000건 이하여야 합니다.' :
        '건수는 0 이상의 정수, 시간은 0~86,400초 또는 빈칸으로 입력하세요. 각 조건의 사례 합은 5,000건 이하입니다.';
      error.hidden = false; status.textContent = '입력 범위를 확인하세요.';
    }
  };
  form.addEventListener('input',invalidate);
  form.addEventListener('submit',event => { event.preventDefault(); execute(); });
  get('enquiry-reset').addEventListener('click',() => { form.reset(); execute(); });
  const show = (format: 'json' | 'csv') => {
    if (!run) return;
    preview.value = format === 'json' ? enquiryJsonExport(run) : enquiryCsvExport(run);
    preview.hidden = false; get('enquiry-format-status').textContent = `${format.toUpperCase()} 결과 미리보기 · 입력·가정·모델·소스 버전 포함`;
  };
  jsonButton.addEventListener('click',()=>show('json'));
  csvButton.addEventListener('click',()=>show('csv'));
  form.reset(); execute();
}
