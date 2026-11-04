import { evaluatePeerEnquiry } from './inquiry-policy.ts';
import type { PeerEnquiryScenario, PeerEnquiryDecision } from './inquiry-policy.ts';

export interface EnquiryCohort {
  id: string; count: number; answer: PeerEnquiryScenario;
}
export interface EnquiryScenario {
  id: string; cohorts: EnquiryCohort[];
  priorKnown?: { count: number; provenance: 'synthetic'; informationSource: 'checker-prior-authorization' };
}
export interface EnquirySummary {
  scenarioId: string; caseCount: number; firstEnquiryCount: number;
  priorKnownCaseCount: number; priorKnowledgeSource: 'checker-prior-authorization' | null;
  priorInformationCostSec: null;
  closedOnPeerReport: number; followUpCaseCount: number;
  knownFirstEnquirySubtotalSec: number; unknownFirstEnquiryCaseCount: number;
  firstEnquiryTotalSec: number | null;
  additionalEnquiryCount: null; followUpTotalSec: null; wholeVerificationSec: null;
  rows: { id: string; count: number; decision: PeerEnquiryDecision }[];
}

function validId(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
}

/** Weighted first-contact cases; no allocation of actual people or invented later contacts. */
export function summarizeEnquiryScenario(input: EnquiryScenario): EnquirySummary {
  if (!input || !validId(input.id) || !Array.isArray(input.cohorts) || input.cohorts.length > 50) {
    throw new TypeError('A coded scenario with at most 50 cohorts is required.');
  }
  const prior = input.priorKnown;
  if (prior !== undefined && (!prior || prior.provenance !== 'synthetic' ||
      prior.informationSource !== 'checker-prior-authorization' || !Number.isInteger(prior.count) ||
      prior.count < 0 || prior.count > 5000)) {
    throw new TypeError('Prior information requires a synthetic count and explicit checker-authorization source.');
  }
  const priorKnownCaseCount = prior?.count ?? 0;
  let caseCount = priorKnownCaseCount, closedOnPeerReport = 0, followUpCaseCount = 0;
  let knownFirstEnquirySubtotalSec = 0, unknownFirstEnquiryCaseCount = 0;
  const ids = new Set<string>();
  const rows = input.cohorts.map(cohort => {
    if (!cohort || !validId(cohort.id) || ids.has(cohort.id) ||
        !Number.isInteger(cohort.count) || cohort.count < 0 || cohort.count > 5000) {
      throw new TypeError('Cohorts require unique codes and integer counts from 0 to 5000.');
    }
    ids.add(cohort.id);
    caseCount += cohort.count;
    if (caseCount > 5000) throw new RangeError('At most 5000 hypothetical cases per scenario.');
    const decision = evaluatePeerEnquiry(cohort.answer);
    if (decision.state === 'closed-on-peer-report') closedOnPeerReport += cohort.count;
    else followUpCaseCount += cohort.count;
    if (decision.enquiryDurationSec === null) unknownFirstEnquiryCaseCount += cohort.count;
    else knownFirstEnquirySubtotalSec += cohort.count * decision.enquiryDurationSec;
    return { id: cohort.id, count: cohort.count, decision };
  });
  return { scenarioId: input.id, caseCount, firstEnquiryCount: caseCount-priorKnownCaseCount,
    priorKnownCaseCount, priorKnowledgeSource: prior?.informationSource ?? null, priorInformationCostSec: null, closedOnPeerReport,
    followUpCaseCount, knownFirstEnquirySubtotalSec, unknownFirstEnquiryCaseCount,
    firstEnquiryTotalSec: unknownFirstEnquiryCaseCount ? null : knownFirstEnquirySubtotalSec,
    additionalEnquiryCount: null, followUpTotalSec: null, wholeVerificationSec: null, rows };
}

export interface EnquiryComparison {
  schemaVersion: 2; modelVersion: 'enquiry-scenarios-v2'; provenance: 'synthetic'; units: 'seconds';
  policyVersion: 'peer-enquiry-v1'; sourceRevision: string; generatedAt: string; ruleSources: string[];
  assumptions: string[]; limitations: string[];
  inputs: [EnquiryScenario, EnquiryScenario]; results: [EnquirySummary, EnquirySummary];
  sameCaseCount: boolean; firstEnquiryDifferenceBMinusASec: number | null;
  firstEnquiryCountDifferenceBMinusA: number;
}

export function compareEnquiryScenarios(a: EnquiryScenario, b: EnquiryScenario,
  meta: { sourceRevision: string; generatedAt: string }): EnquiryComparison {
  if (!meta.sourceRevision?.trim() || !Number.isFinite(Date.parse(meta.generatedAt)) || a?.id === b?.id) {
    throw new TypeError('Distinct scenario codes, source revision and run date are required.');
  }
  const left = summarizeEnquiryScenario(a), right = summarizeEnquiryScenario(b);
  return {
    schemaVersion: 2, modelVersion: 'enquiry-scenarios-v2', provenance: 'synthetic', units: 'seconds',
    policyVersion: 'peer-enquiry-v1', sourceRevision: meta.sourceRevision, generatedAt: meta.generatedAt,
    ruleSources: ['data/student-escalation-procedure-2026-10-31.json',
      'data/student-peer-stopping-rule-2026-10-31.json',
      'data/student-uncertain-followup-rule-2026-10-31.json',
      'data/student-workflow-confirmation-2026-11-04.json'],
    assumptions: ['Prior-known destination cases skip the first peer enquiry, with source recorded as checker prior authorization.',
      'Other hypothetical cases each have one first peer enquiry; per-case time is multiplied by cohort count.',
      'Counts and times are hypothetical, not fitted school observations.',
      'Both scenarios use the same first-contact policy; distributions of answers may differ.',
      'Explicit uncertainty takes priority; follow-up contacts are options, not a fixed ordered schedule.'],
    limitations: ['Peer-report closure does not establish true destination, authorization or attendance accuracy.',
      'Prior-information acquisition, maintenance and handoff costs remain unknown; fewer first enquiries are not a net-work or whole-time saving.',
      'Follow-up count, duration, scan/recheck time and whole verification time remain unknown.',
      'Known time subtotal is not a complete total when positive-count cases have unknown time.',
      'Cross-scenario differences are not a measured policy effect or guaranteed time saving.'],
    inputs: structuredClone([a, b]), results: [left, right], sameCaseCount: left.caseCount === right.caseCount,
    firstEnquiryCountDifferenceBMinusA: right.firstEnquiryCount-left.firstEnquiryCount,
    firstEnquiryDifferenceBMinusASec: left.firstEnquiryTotalSec === null || right.firstEnquiryTotalSec === null ?
      null : right.firstEnquiryTotalSec - left.firstEnquiryTotalSec,
  };
}

export function enquiryJsonExport(run: EnquiryComparison): string {
  return JSON.stringify(run, null, 2) + '\n';
}

/** Summary rows retain zero-case scenarios; cohort rows retain each explicit input and result. */
export function enquiryCsvExport(run: EnquiryComparison): string {
  const cell = (value: string | number | boolean | null): string => {
    const text = value === null ? 'unknown' : String(value);
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const header = ['row_kind','schema_version','model_version','policy_version','provenance','units','source_revision','generated_at',
    'rule_sources','assumptions','limitations','scenario','cohort','case_count','specific_destination',
    'uncertainty','per_case_first_enquiry_sec','decision','independent_verification','closed_on_peer_report',
    'prior_known_cases','prior_information_source','first_enquiry_count','prior_information_cost_sec',
    'follow_up_cases','known_first_enquiry_subtotal_sec','unknown_time_cases','first_enquiry_total_sec',
    'additional_enquiry_count','follow_up_total_sec','whole_verification_sec'];
  const lines = [header.map(cell).join(',')];
  for (let i = 0; i < run.results.length; i++) {
    const summary = run.results[i]!, input = run.inputs[i]!;
    const base = [run.schemaVersion, run.modelVersion, run.policyVersion, run.provenance, run.units, run.sourceRevision,
      run.generatedAt, run.ruleSources.join(' | '), run.assumptions.join(' | '), run.limitations.join(' | '), summary.scenarioId];
    const totals = [summary.closedOnPeerReport, summary.priorKnownCaseCount, summary.priorKnowledgeSource,
      summary.firstEnquiryCount, summary.priorInformationCostSec, summary.followUpCaseCount, summary.knownFirstEnquirySubtotalSec,
      summary.unknownFirstEnquiryCaseCount, summary.firstEnquiryTotalSec, summary.additionalEnquiryCount,
      summary.followUpTotalSec, summary.wholeVerificationSec];
    lines.push(['summary', ...base, '', summary.caseCount, '', '', '', '', 'not-established', ...totals].map(cell).join(','));
    if (input.priorKnown !== undefined) {
      lines.push(['prior-known', ...base, 'prior-information', input.priorKnown.count, '', '', 0,
        'first-enquiry-skipped', 'not-established', ...totals].map(cell).join(','));
    }
    summary.rows.forEach((row, index) => {
      const answer = input.cohorts[index]!.answer;
      lines.push(['cohort', ...base, row.id, row.count, answer.specificDestinationReported, answer.uncertaintyReported,
        answer.enquiryDurationSec, row.decision.state, row.decision.independentVerification, ...totals].map(cell).join(','));
    });
  }
  return lines.join('\r\n') + '\r\n';
}
