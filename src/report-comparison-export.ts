import { compareDestinations, trimDestination } from './report-consistency.ts';

export const REPORT_COMPARISON_VERSION = 'report-comparison-v1';
export interface ReportMetadata {
  generatedAt: string;
  sourceRevision: string | null;
  sourceFingerprint: string | null;
}

/** Records a hypothetical text comparison, never an attendance or location finding. */
export function makeReportComparison(first: string | null, second: string | null, metadata: ReportMetadata) {
  for (const value of [first, second]) {
    if (value !== null && typeof value !== 'string') throw new TypeError('Answers must be strings or null.');
  }
  if (!metadata || typeof metadata.generatedAt !== 'string' ||
      !Number.isFinite(Date.parse(metadata.generatedAt)) ||
      new Date(metadata.generatedAt).toISOString() !== metadata.generatedAt) {
    throw new TypeError('generatedAt must be a canonical UTC ISO timestamp.');
  }
  if (metadata.sourceRevision !== null &&
      (typeof metadata.sourceRevision !== 'string' || !/^[a-f0-9]{40}(?:\+dirty:[a-f0-9]{12})?$/.test(metadata.sourceRevision))) {
    throw new TypeError('sourceRevision must be a Git revision with optional dirty fingerprint, or null.');
  }
  if (metadata.sourceFingerprint !== null &&
      (typeof metadata.sourceFingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(metadata.sourceFingerprint))) {
    throw new TypeError('sourceFingerprint must be a SHA-256 fingerprint or null.');
  }
  return {
    schemaVersion: 1 as const,
    modelVersion: REPORT_COMPARISON_VERSION,
    provenance: 'synthetic' as const,
    generatedAt: metadata.generatedAt,
    sourceRevision: metadata.sourceRevision,
    sourceFingerprint: metadata.sourceFingerprint,
    raw: { first, second },
    normalized: { first: trimDestination(first), second: trimDestination(second) },
    result: compareDestinations(first, second),
    rules: ['null, blank or exact trimmed 모름 => unknown before equality', 'trim edges only; case-sensitive exact equality'],
    scope: 'hypothetical-text-comparison-only',
    independentVerification: 'not-established' as const,
    limitations: ['Agreement does not establish a true destination or authorization.', 'Does not change attendance or enquiry policy.'],
    sources: ['src/report-consistency.ts', 'data/student-report-consistency-case-2026-11-16.json', 'data/student-unknown-marker-change-2026-11-17.json'],
  };
}
export type ReportComparison = ReturnType<typeof makeReportComparison>;

export function reportJsonExport(run: ReportComparison): string {
  return JSON.stringify(run, null, 2) + '\n';
}

/** Every CSV cell contains a JSON value: null, empty text and literal text stay distinct.
 * JSON string cells begin with a quote, preventing spreadsheet formula execution.
 */
export function reportCsvExport(run: ReportComparison): string {
  const fields = {
    schema_version: run.schemaVersion, model_version: run.modelVersion, provenance: run.provenance,
    generated_at: run.generatedAt, source_revision: run.sourceRevision, source_fingerprint: run.sourceFingerprint,
    first_raw: run.raw.first, second_raw: run.raw.second,
    first_normalized: run.normalized.first, second_normalized: run.normalized.second,
    result: run.result, rules: run.rules, scope: run.scope,
    independent_verification: run.independentVerification, limitations: run.limitations, sources: run.sources,
  };
  const cell = (value: unknown) => '"' + JSON.stringify(value).replaceAll('"', '""') + '"';
  return Object.keys(fields).join(',') + '\r\n' + Object.values(fields).map(cell).join(',') + '\r\n';
}
