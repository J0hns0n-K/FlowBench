import { makeReportComparison, reportJsonExport, reportCsvExport } from './report-comparison-export.ts';
import type { ReportComparison, ReportMetadata } from './report-comparison-export.ts';

/** A synthetic two-answer playground; it does not change attendance or enquiry decisions. */
export function initializeReportComparison(metadata: Omit<ReportMetadata,'generatedAt'>): void {
  const get = <T extends HTMLElement>(id: string): T => {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Missing report comparison element ${id}`);
    return node as T;
  };
  const form = get<HTMLFormElement>('report-form');
  const first = get<HTMLInputElement>('report-first'), second = get<HTMLInputElement>('report-second');
  const result = get('report-result'), status = get('report-status');
  const preview = get<HTMLTextAreaElement>('report-preview');
  const jsonButton = get<HTMLButtonElement>('report-json'), csvButton = get<HTMLButtonElement>('report-csv');
  let run: ReportComparison | null = null;
  const clearPreview = () => {
    preview.value = ''; preview.hidden = true;
    get('report-format-status').textContent = '';
  };
  const descriptions = {
    same: { title:'내용이 같음', explanation:'앞뒤 공백을 지운 두 답변의 글자가 같습니다.' },
    conflict: { title:'내용이 서로 다름', explanation:'앞뒤 공백을 지워도 두 답변의 글자가 다릅니다.' },
    unknown: { title:'비교할 정보가 부족함', explanation:'답변이 빈칸이거나, 앞뒤 공백을 지운 값이 ‘모름’입니다. 같은지 다른지 판정하기 전에 미확인으로 처리합니다.' },
  };
  const compare = () => {
    clearPreview();
    run = makeReportComparison(first.value,second.value,{...metadata,generatedAt:new Date().toISOString()});
    const value = run.result;
    const description = descriptions[value];
    get('report-code').textContent = value;
    get('report-label').textContent = description.title;
    get('report-explanation').textContent = description.explanation;
    get('report-first-normalized').textContent = JSON.stringify(run.normalized.first);
    get('report-second-normalized').textContent = JSON.stringify(run.normalized.second);
    result.dataset.state = value; result.hidden = false;
    jsonButton.disabled = false; csvButton.disabled = false;
    status.textContent = '가상 답변 비교 완료';
  };
  const examples: Record<string,readonly [string,string]> = {
    different:['병원','반'], spaced:['  병원  ','병원'], missing:['모름','모름'],
  };
  for (const [id,values] of Object.entries(examples)) {
    get(`report-example-${id}`).addEventListener('click',() => {
      first.value=values[0]; second.value=values[1]; compare();
    });
  }
  form.addEventListener('submit',event => { event.preventDefault(); compare(); });
  form.addEventListener('input',() => {
    run = null; clearPreview(); jsonButton.disabled = true; csvButton.disabled = true;
    result.hidden = true;
    status.textContent = '입력이 바뀌었습니다. 답변 비교를 눌러 다시 확인하세요.';
  });
  const show = (format:'json'|'csv') => {
    if (!run) return;
    preview.value = format === 'json' ? reportJsonExport(run) : reportCsvExport(run);
    preview.hidden = false;
    get('report-format-status').textContent = `${format.toUpperCase()} 가상 실험 기록 · 원래 입력·정리한 값·규칙·소스 버전 포함`;
  };
  jsonButton.addEventListener('click',() => show('json'));
  csvButton.addEventListener('click',() => show('csv'));
  form.reset(); compare();
}
