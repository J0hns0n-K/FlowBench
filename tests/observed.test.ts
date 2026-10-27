import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizePeerTiming } from '../src/observed.ts';
import type { PeerTimingRecord } from '../src/observed.ts';

const fixture = (): PeerTimingRecord => JSON.parse(readFileSync(
  new URL('../data/peer-timed-baseline-2026-10-27.json', import.meta.url), 'utf8')) as PeerTimingRecord;

test('peer timing snapshot has independently calculated 103/160/263 totals and 120 roster places', () => {
  const result = summarizePeerTiming(fixture());
  assert.equal(result.groupCount, 8);
  assert.equal(result.targetRosterCount, 120);
  assert.equal(result.seatingSec, 103);
  assert.equal(result.verificationSec, 160);
  assert.equal(result.reportedPhaseSumSec, 263);
  assert.deepEqual(result.rows.map(row => row.cumulativeVerificationSec), [10,44,73,91,110,136,156,160]);
  assert.deepEqual(result.rows.map(row => row.cumulativeReportedPhaseSec), [113,147,176,194,213,239,259,263]);
});

test('source attribution and unknown metadata survive accounting without invented components', () => {
  const result = summarizePeerTiming(fixture());
  assert.equal(result.source.sourceKind, 'user-report-of-peer-timing');
  assert.equal(result.source.observedOn, null);
  assert.equal(result.source.timingInstrument, null);
  assert.equal(result.source.actualSessionAttendance, null);
  assert.deepEqual(result.rows.map(row => row.turnSec), [10,34,29,18,19,26,20,4]);
  assert.ok(result.source.limitations.some(note => note.includes('not identified')));
});

test('accounting does not mutate source and the result owns a separate snapshot', () => {
  const input = fixture(), before = structuredClone(input);
  const result = summarizePeerTiming(input);
  assert.deepEqual(input, before);
  input.turns[0]!.turnSec = 999;
  input.limitations[0] = 'changed';
  assert.equal(result.rows[0]!.turnSec, 10);
  assert.equal(result.source.turns[0]!.turnSec, 10);
  assert.notEqual(result.source.limitations[0], 'changed');
});

test('reject invalid timings, duplicate groups and non-integer roster counts', () => {
  for (const duration of [0,-1,NaN,Infinity,86401]) {
    const input = fixture(); input.turns[0]!.turnSec = duration;
    assert.throws(() => summarizePeerTiming(input));
  }
  for (const duration of [-1,NaN,Infinity]) {
    assert.throws(() => summarizePeerTiming({...fixture(), seatingSec: duration}));
  }
  const duplicate = fixture(); duplicate.turns[1]!.group = duplicate.turns[0]!.group;
  assert.throws(() => summarizePeerTiming(duplicate));
  const fractional = fixture(); fractional.turns[0]!.rosterCount = 1.5;
  assert.throws(() => summarizePeerTiming(fractional));
  assert.throws(() => summarizePeerTiming({...fixture(), turns: []}));
});

test('do not accept synthetic records, wrong units or omitted provenance as observed baselines', () => {
  assert.throws(() => summarizePeerTiming(null));
  for (const override of [{sourceKind:'synthetic'}, {units:'minutes'}, {schemaVersion:2},
    {recordId:''}, {reportedOn:'unknown'}, {limitations:[]}]) {
    assert.throws(() => summarizePeerTiming({...fixture(), ...override}));
  }
});
