import test from 'node:test';
import assert from 'node:assert/strict';
import { compareDestinations } from '../src/report-consistency.ts';

test('missing or blank information takes priority in either input position', () => {
  for (const missing of [null, '', ' ', '\t\n']) {
    for (const other of [null, '', 'LOC_A']) {
      assert.equal(compareDestinations(missing,other),'unknown');
      assert.equal(compareDestinations(other,missing),'unknown');
    }
  }
});

test('trimmed agreement and conflict are symmetric and do not erase distinct location codes', () => {
  const cases = [
    ['LOC_A','LOC_A','same'], [' LOC_A ','LOC_A\t','same'],
    ['LOC_A','LOC_B','conflict'], ['LOC_A','loc_a','conflict'],
  ] as const;
  for (const [first,second,expected] of cases) {
    assert.equal(compareDestinations(first,second),expected);
    assert.equal(compareDestinations(second,first),expected);
  }
  // Agreement describes two reports; actual location is not an input or a verified result.
  assert.equal(compareDestinations('LOC_A','LOC_A'),'same');
});

test('explicit 모름 takes priority over equal reports in either position', () => {
  for (const unknown of ['모름',' 모름 ','\t모름\n']) {
    for (const other of [null,'','병원','모름',' 모름 ']) {
      assert.equal(compareDestinations(unknown,other),'unknown');
      assert.equal(compareDestinations(other,unknown),'unknown');
    }
  }
});
