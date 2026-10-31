import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePeerEnquiry } from '../src/inquiry-policy.ts';
import type { PeerEnquiryScenario } from '../src/inquiry-policy.ts';

const certain: PeerEnquiryScenario = {
  provenance: 'synthetic', specificDestinationReported: true,
  uncertaintyReported: false, enquiryDurationSec: null,
};

test('specific peer report ends enquiries without claiming independent verification', () => {
  const decision = evaluatePeerEnquiry(certain);
  assert.equal(decision.state, 'closed-on-peer-report');
  assert.deepEqual(decision.nextContactOptions, []);
  assert.equal(decision.informationSource, 'peer-report');
  assert.equal(decision.independentVerification, 'not-established');
  assert.equal(decision.provenance, 'synthetic-policy-evaluation');
});

test('reported doubt overrides a precise answer and preserves alternative follow-up targets', () => {
  const scenario = Object.freeze({ ...certain, uncertaintyReported: true });
  const before = structuredClone(scenario);
  const decision = evaluatePeerEnquiry(scenario);
  assert.equal(decision.state, 'follow-up-required');
  assert.equal(decision.reason, 'uncertainty-reported');
  assert.deepEqual(new Set(decision.nextContactOptions), new Set(['leader', 'dormitory-supervisor']));
  assert.deepEqual(scenario, before);
  // Incomplete information must not silently become a resolved attendance status.
  assert.equal(evaluatePeerEnquiry({ ...certain, specificDestinationReported: false }).state, 'follow-up-required');
});

test('a specific but wrong hypothetical report can still close: truth is not a policy input', () => {
  // Assisted counterexample, not a field error: identical observable inputs,
  // different hypothetical truth. The rule cannot distinguish these worlds.
  const worlds = [
    { destinationActuallyCorrect: true, report: { ...certain } },
    { destinationActuallyCorrect: false, report: { ...certain } },
  ];
  const correct = evaluatePeerEnquiry(worlds[0]!.report);
  const incorrect = evaluatePeerEnquiry(worlds[1]!.report);
  assert.deepEqual(correct, incorrect);
  assert.equal(incorrect.state, 'closed-on-peer-report');
  assert.equal(incorrect.independentVerification, 'not-established');
});

test('unknown time stays unknown and an explicitly zero duration is distinct', () => {
  assert.equal(evaluatePeerEnquiry(certain).enquiryDurationSec, null);
  assert.equal(evaluatePeerEnquiry({ ...certain, enquiryDurationSec: 0 }).enquiryDurationSec, 0);
  assert.equal(evaluatePeerEnquiry({ ...certain, enquiryDurationSec: 9 }).enquiryDurationSec, 9);
});

test('missing certainty, invalid time and empirical provenance are rejected', () => {
  for (const input of [null, [], { ...certain, uncertaintyReported: undefined },
    { ...certain, uncertaintyReported: null }, { ...certain, uncertaintyReported: 'false' },
    { ...certain, provenance: 'user-reported-direct-performance' },
    { ...certain, enquiryDurationSec: undefined }, { ...certain, enquiryDurationSec: '11' }]) {
    assert.throws(() => evaluatePeerEnquiry(input), TypeError);
  }
  for (const enquiryDurationSec of [-1, NaN, Infinity, 86401]) {
    assert.throws(() => evaluatePeerEnquiry({ ...certain, enquiryDurationSec }), RangeError);
  }
});
