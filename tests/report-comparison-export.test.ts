import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReportComparison, reportJsonExport, reportCsvExport } from '../src/report-comparison-export.ts';
import { compareDestinations } from '../src/report-consistency.ts';

const meta = { generatedAt: '2026-11-17T03:00:00.000Z', sourceRevision: 'a'.repeat(40) + '+dirty:' + 'b'.repeat(12), sourceFingerprint: 'b'.repeat(64) };

test('JSON preserves raw input, normalized values, metadata and replayable helper result', () => {
  for (const [first, second] of [[null, ''], ['', 'unknown'], ['  병원\n', '병원'], [' 모름 ', '모름'], ['병원', '반']] as const) {
    const run = makeReportComparison(first, second, meta);
    const restored = JSON.parse(reportJsonExport(run));
    assert.deepEqual(restored, run);
    assert.deepEqual(restored.raw, { first, second });
    assert.deepEqual(restored.normalized, { first: first?.trim() ?? null, second: second?.trim() ?? null });
    assert.equal(compareDestinations(restored.raw.first, restored.raw.second), restored.result);
    assert.equal(restored.provenance, 'synthetic');
    assert.equal(restored.independentVerification, 'not-established');
    assert.deepEqual(makeReportComparison(restored.raw.first, restored.raw.second, restored), run);
  }
});

test('unknown source metadata stays null and caller metadata mutation cannot change the record', () => {
  const metadata = { ...meta, sourceRevision: null, sourceFingerprint: null };
  const run = makeReportComparison(null, '', metadata);
  metadata.generatedAt = '2026-11-18T00:00:00.000Z';
  assert.equal(run.generatedAt, meta.generatedAt);
  assert.equal(run.sourceRevision, null); assert.equal(run.sourceFingerprint, null);
  assert.equal(run.normalized.first, null); assert.equal(run.normalized.second, '');
});

test('CSV JSON-valued cells preserve null, blanks, commas, quotes, line breaks and formula-like strings', () => {
  const decode = (csv: string) => {
    const [header, data] = csv.trimEnd().split('\r\n');
    const matches = [...data!.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)];
    const values = matches.map(match => JSON.parse(match[1]!.replaceAll('""', '"')));
    assert.equal(values.length, header!.split(',').length);
    return Object.fromEntries(header!.split(',').map((key, index) => [key, values[index]]));
  };
  for (const first of [null, '', 'unknown', '=SUM(1,2)', '+1', '-1', '@abc', '\t=1', '病院,"반"\r\n다음']) {
    const run = makeReportComparison(first, ' 모름 ', meta);
    const csv = reportCsvExport(run), decoded = decode(csv);
    assert.equal(decoded.first_raw, first);
    assert.equal(decoded.first_normalized, first?.trim() ?? null);
    assert.equal(decoded.second_raw, ' 모름 ');
    assert.equal(decoded.result, run.result);
    assert.deepEqual(decoded.sources, run.sources);
    assert.equal(decoded.source_fingerprint, meta.sourceFingerprint);
    // Text values in the logical spreadsheet cells begin with a JSON quote, not a formula.
    if (first !== null) assert.ok(csv.includes('"""' + JSON.stringify(first).slice(1, -1).replaceAll('"', '""')));
  }
});

test('record creation rejects malformed input and misleading version metadata', () => {
  for (const value of [undefined, 1, {}, false]) {
    assert.throws(() => makeReportComparison(value as never, '', meta), TypeError);
    assert.throws(() => makeReportComparison('', value as never, meta), TypeError);
  }
  for (const generatedAt of ['', 'invalid', '2026-02-30T00:00:00.000Z', '2026-11-17', '2026-11-17T03:00:00Z']) {
    assert.throws(() => makeReportComparison('', '', { ...meta, generatedAt }), TypeError);
  }
  for (const sourceRevision of ['', 'unavailable-source-revision', 'a'.repeat(39)]) {
    assert.throws(() => makeReportComparison('', '', { ...meta, sourceRevision }), TypeError);
  }
  for (const sourceFingerprint of ['', 'g'.repeat(64), 'b'.repeat(63)]) {
    assert.throws(() => makeReportComparison('', '', { ...meta, sourceFingerprint }), TypeError);
  }
});
