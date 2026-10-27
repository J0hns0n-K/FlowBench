import { MODEL_VERSION, compareWorkflows } from './workflow.ts';
import type { Comparison, Group } from './workflow.ts';
import type { GeneratorConfig } from './scenario.ts';

export interface RunMetadata {
  sourceRevision: string; generatedAt: string; generator: GeneratorConfig | null;
  inputLabel: string;
}
export interface Experiment {
  schemaVersion: 1; modelVersion: string; provenance: 'synthetic'; units: 'seconds';
  sourceRevision: string; generatedAt: string; inputLabel: string;
  generator: GeneratorConfig | null; assumptions: string[]; limitations: string[];
  inputs: Group[]; targetSec: number; comparison: Comparison;
}

export function makeExperiment(groups: readonly Group[], targetSec: number, meta: RunMetadata): Experiment {
  if (!meta.sourceRevision || !meta.inputLabel || !Number.isFinite(Date.parse(meta.generatedAt))) {
    throw new TypeError('Export metadata requires source revision, input label and an ISO-compatible date.');
  }
  const comparison = compareWorkflows(groups, targetSec);
  return {
    schemaVersion: 1, modelVersion: MODEL_VERSION, provenance: 'synthetic', units: 'seconds',
    sourceRevision: meta.sourceRevision, generatedAt: meta.generatedAt, inputLabel: meta.inputLabel,
    generator: meta.generator ? { ...meta.generator } : null,
    assumptions: [
      'Group count/report durations are synthetic, not measured school data.',
      'Serial variant waits for each report before starting the next group count.',
      'Parallel variant starts all counts at t=0 and uses one FCFS reporting coordinator.',
      'Equal-time reports follow original input order; all tasks are completed.',
      'Target is an experimental completion-time threshold, not a lateness policy.',
    ],
    limitations: [
      'One-class-at-a-time ordering is user-reported; durations and zero-gap handoffs are not field-validated.',
      'The approximate five-minute user estimate was not used to calibrate inputs.',
      'No modelled attendance accuracy, interruptions, walking or communication failure.',
      'This run establishes no measured school improvement or independent student authorship.',
    ],
    inputs: groups.map(group => ({ ...group })), targetSec, comparison,
  };
}

export function jsonExport(experiment: Experiment): string {
  return JSON.stringify(experiment, null, 2) + '\n';
}

function csvCell(value: string | number): string {
  const text = String(value);
  // Anonymous IDs and internal metadata are normally safe; keep custom labels safe in spreadsheets too.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** Flat event CSV carries provenance, assumptions, summary metrics and source revision on every row. */
export function csvExport(experiment: Experiment): string {
  const headings = ['schema_version','model_version','source_revision','generated_at','provenance','units',
    'input_label','generator_json','assumptions_json','limitations_json','mode','target_sec',
    'group_id','count_sec','report_sec','count_start_sec','count_end_sec',
    'report_start_sec','report_end_sec','report_wait_sec','total_sec','mean_report_wait_sec',
    'p95_report_wait_sec','report_busy_fraction','beyond_target','beyond_target_fraction'];
  const rows: (string | number)[][] = [headings];
  for (const result of [experiment.comparison.baseline, experiment.comparison.candidate]) {
    for (const event of result.events) {
      rows.push([experiment.schemaVersion, experiment.modelVersion, experiment.sourceRevision,
        experiment.generatedAt, experiment.provenance, experiment.units, experiment.inputLabel,
        JSON.stringify(experiment.generator), JSON.stringify(experiment.assumptions), JSON.stringify(experiment.limitations),
        result.mode, experiment.targetSec, event.id, event.countSec, event.reportSec,
        event.countStartSec, event.countEndSec, event.reportStartSec, event.reportEndSec, event.reportWaitSec,
        result.metrics.totalSec, result.metrics.meanReportWaitSec, result.metrics.p95ReportWaitSec,
        result.metrics.reportBusyFraction, result.metrics.beyondTarget, result.metrics.beyondTargetFraction]);
    }
  }
  return '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
