import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReportComparison, reportJsonExport, reportCsvExport } from '../src/report-comparison-export.ts';
import { compareDestinations, normalizeDestinationLabel } from '../src/report-consistency.ts';

const meta = { generatedAt: '2026-11-17T03:00:00.000Z', sourceRevision: 'a'.repeat(40) + '+dirty:' + 'b'.repeat(12), sourceFingerprint: 'b'.repeat(64) };

const decodeCsv = (csv: string) => {
  const [header, data] = csv.trimEnd().split('\r\n');
  const matches = [...data!.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)];
  const values = matches.map(match => JSON.parse(match[1]!.replaceAll('""', '"')));
  assert.equal(values.length, header!.split(',').length);
  return Object.fromEntries(header!.split(',').map((key, index) => [key, values[index]]));
};

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
  for (const first of [null, '', 'unknown', '=SUM(1,2)', '+1', '-1', '@abc', '\t=1', '病院,"반"\r\n다음']) {
    const run = makeReportComparison(first, ' 모름 ', meta);
    const csv = reportCsvExport(run), decoded = decodeCsv(csv);
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

test('dual comparison preserves strict results, exact alias scope and missing-before-equality priority', () => {
  const cases = [
    ['병원', 'hospital', 'conflict', 'same'], [' hospital ', '병원', 'conflict', 'same'],
    ['Hospital', '병원', 'conflict', 'conflict'], ['hos pital', '병원', 'conflict', 'conflict'],
    ['학교 카페', '학교카페', 'conflict', 'conflict'], ['병원A', '병원B', 'conflict', 'conflict'],
    [null, 'hospital', 'unknown', 'unknown'], ['', 'hospital', 'unknown', 'unknown'],
    [' 모름 ', 'hospital', 'unknown', 'unknown'], ['모름', '모름', 'unknown', 'unknown'],
    ['__proto__', 'constructor', 'conflict', 'conflict'],
  ] as const;
  for (const [first, second, strict, alias] of cases) {
    for (const [a,b] of [[first,second],[second,first]]) {
      const run = makeReportComparison(a!, b!, meta);
      assert.equal(run.result, strict); assert.equal(run.aliasComparison.result, alias);
      assert.deepEqual(run.raw, { first:a, second:b });
      for (const normalized of Object.values(run.aliasComparison.normalized)) {
        assert.equal(normalizeDestinationLabel(normalized), normalized);
      }
      assert.equal(run.independentVerification, 'not-established');
    }
  }
});

test('v2 JSON embeds the alias table and both results can be replayed from the retained raw inputs', () => {
  for (const first of [' hospital ', 'Hospital', '病院', null, '', '모름', '학교 카페']) {
    const run = makeReportComparison(first, '병원', meta);
    const restored = JSON.parse(reportJsonExport(run));
    assert.equal(restored.schemaVersion, 2); assert.equal(restored.modelVersion, 'report-comparison-v2');
    assert.equal(restored.aliasComparison.modelVersion, 'hospital-label-v1');
    assert.deepEqual(restored.aliasComparison.aliasTable, [{ from:'hospital', to:'병원' }]);
    const replayLabel = (value:string|null) => {
      if (value === null) return null;
      const trimmed = value.trim();
      return restored.aliasComparison.aliasTable.find((entry:{from:string;to:string}) => entry.from === trimmed)?.to ?? trimmed;
    };
    const normalized = { first:replayLabel(restored.raw.first), second:replayLabel(restored.raw.second) };
    assert.deepEqual(restored.aliasComparison.normalized, normalized);
    assert.equal(compareDestinations(normalized.first, normalized.second), restored.aliasComparison.result);
    assert.equal(compareDestinations(restored.raw.first, restored.raw.second), restored.result);
    assert.ok(restored.sources.includes('data/student-alias-pair-2026-11-18.json'));
    assert.ok(restored.limitations.includes('Alias agreement describes equivalent labels, not the same physical hospital.'));
  }
  const run = makeReportComparison('hospital', '병원', meta);
  run.aliasComparison.aliasTable.pop();
  assert.deepEqual(makeReportComparison('hospital', '병원', meta).aliasComparison.aliasTable, [{ from:'hospital', to:'병원' }]);
});

test('v2 CSV keeps strict and alias-normalized values, policy metadata and nullable source metadata distinct', () => {
  for (const first of [null, '', 'unknown', ' hospital ', '=1,"x"\nnext']) {
    const run = makeReportComparison(first, '병원', { ...meta, sourceRevision:null, sourceFingerprint:null });
    const csv = reportCsvExport(run), decoded = decodeCsv(csv);
    assert.equal(csv.split('\r\n')[0]!.split(',').length, 22);
    assert.equal(decoded.schema_version, 2); assert.equal(decoded.first_raw, first);
    assert.equal(decoded.first_normalized, run.normalized.first);
    assert.equal(decoded.first_alias_normalized, run.aliasComparison.normalized.first);
    assert.equal(decoded.second_alias_normalized, '병원');
    assert.equal(decoded.result, run.result); assert.equal(decoded.alias_result, run.aliasComparison.result);
    assert.equal(decoded.alias_model_version, 'hospital-label-v1');
    assert.deepEqual(decoded.alias_table, run.aliasComparison.aliasTable);
    assert.deepEqual(decoded.alias_rules, run.aliasComparison.rules);
    assert.equal(decoded.source_revision, null); assert.equal(decoded.source_fingerprint, null);
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
