import { finiteInRange, percentile, simulateFCFS, MAX_DURATION_SEC } from './engine.ts';

export const MODEL_VERSION = 'seated-verification-v1';
export type Mode = 'serial' | 'parallel';
export interface Group { id: string; countSec: number; reportSec: number }
export interface GroupEvent extends Group {
  countStartSec: number; countEndSec: number; reportStartSec: number;
  reportEndSec: number; reportWaitSec: number;
}
export interface Metrics {
  groups: number; totalSec: number; meanReportWaitSec: number; p95ReportWaitSec: number;
  maxReportWaitSec: number; reportBusyFraction: number; beyondTarget: number; beyondTargetFraction: number;
}
export interface WorkflowResult { mode: Mode; targetSec: number; events: GroupEvent[]; metrics: Metrics }
export interface Comparison {
  baseline: WorkflowResult; candidate: WorkflowResult; savedSec: number; savedFraction: number | null;
}

export function simulateWorkflow(groups: readonly Group[], mode: Mode, targetSec: number): WorkflowResult {
  if (mode !== 'serial' && mode !== 'parallel') throw new TypeError('Unknown workflow mode.');
  finiteInRange(targetSec, 'targetSec', 0, MAX_DURATION_SEC);
  if (groups.length > 100) throw new RangeError('At most 100 anonymous groups are supported.');
  // Validate both durations even when one stage is not directly scheduled by FCFS.
  for (const group of groups) {
    finiteInRange(group.countSec, 'countSec', 0.001, MAX_DURATION_SEC);
  }
  const reports = simulateFCFS(groups.map(g => ({ id: g.id, arrivalSec: g.countSec, serviceSec: g.reportSec })));
  const byId = new Map(reports.map(event => [event.id, event]));
  let cursor = 0;
  const events = groups.map(group => {
    if (mode === 'serial') {
      const countStartSec = cursor;
      const countEndSec = countStartSec + group.countSec;
      cursor = countEndSec + group.reportSec;
      return { ...group, countStartSec, countEndSec, reportStartSec: countEndSec,
        reportEndSec: cursor, reportWaitSec: 0 };
    }
    const report = byId.get(group.id)!;
    return { ...group, countStartSec: 0, countEndSec: group.countSec,
      reportStartSec: report.startSec, reportEndSec: report.endSec, reportWaitSec: report.waitSec };
  });
  const waits = events.map(event => event.reportWaitSec);
  const totalSec = Math.max(0, ...events.map(event => event.reportEndSec));
  const reportWork = groups.reduce((sum, group) => sum + group.reportSec, 0);
  const beyondTarget = events.filter(event => event.reportEndSec > targetSec).length;
  return { mode, targetSec, events, metrics: {
    groups: groups.length, totalSec,
    meanReportWaitSec: waits.length ? waits.reduce((sum, w) => sum + w, 0) / waits.length : 0,
    p95ReportWaitSec: percentile(waits, 0.95), maxReportWaitSec: Math.max(0, ...waits),
    reportBusyFraction: totalSec ? reportWork / totalSec : 0,
    beyondTarget, beyondTargetFraction: groups.length ? beyondTarget / groups.length : 0,
  } };
}

export function compareWorkflows(groups: readonly Group[], targetSec: number): Comparison {
  const baseline = simulateWorkflow(groups, 'serial', targetSec);
  const candidate = simulateWorkflow(groups, 'parallel', targetSec);
  const savedSec = baseline.metrics.totalSec - candidate.metrics.totalSec;
  return { baseline, candidate, savedSec,
    savedFraction: baseline.metrics.totalSec ? savedSec / baseline.metrics.totalSec : null };
}
