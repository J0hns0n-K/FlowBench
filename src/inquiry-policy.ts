import { finiteInRange, MAX_DURATION_SEC } from './engine.ts';

/** Anonymous hypothetical inputs; this module does not infer certainty from text. */
export interface PeerEnquiryScenario {
  provenance: 'synthetic';
  specificDestinationReported: boolean;
  uncertaintyReported: boolean;
  enquiryDurationSec: number | null;
}

export interface PeerEnquiryDecision {
  modelVersion: 'peer-enquiry-v1';
  provenance: 'synthetic-policy-evaluation';
  state: 'closed-on-peer-report' | 'follow-up-required';
  reason: 'specific-destination-without-reported-uncertainty' | 'uncertainty-reported' | 'destination-not-specific';
  nextContactOptions: ('leader' | 'dormitory-supervisor')[];
  informationSource: 'peer-report';
  independentVerification: 'not-established';
  enquiryDurationSec: number | null;
}

/** First-contact rule only. Follow-up targets are options, not an ordered call schedule. */
export function evaluatePeerEnquiry(input: unknown): PeerEnquiryDecision {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('A synthetic peer-enquiry scenario is required.');
  }
  const value = input as Record<string, unknown>;
  if (value.provenance !== 'synthetic' || typeof value.specificDestinationReported !== 'boolean' ||
      typeof value.uncertaintyReported !== 'boolean' ||
      !(value.enquiryDurationSec === null || typeof value.enquiryDurationSec === 'number')) {
    throw new TypeError('Explicit synthetic provenance, answer flags and numeric or unknown duration are required.');
  }
  if (value.enquiryDurationSec !== null) {
    finiteInRange(value.enquiryDurationSec, 'enquiryDurationSec', 0, MAX_DURATION_SEC);
  }
  // Reported doubt takes priority even if a precise destination was mentioned.
  const closed = value.specificDestinationReported && !value.uncertaintyReported;
  return {
    modelVersion: 'peer-enquiry-v1', provenance: 'synthetic-policy-evaluation',
    state: closed ? 'closed-on-peer-report' : 'follow-up-required',
    reason: value.uncertaintyReported ? 'uncertainty-reported' : closed ?
      'specific-destination-without-reported-uncertainty' : 'destination-not-specific',
    nextContactOptions: closed ? [] : ['leader', 'dormitory-supervisor'],
    informationSource: 'peer-report', independentVerification: 'not-established',
    enquiryDurationSec: value.enquiryDurationSec,
  };
}
