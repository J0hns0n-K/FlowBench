import { finiteInRange, MAX_DURATION_SEC } from './engine.ts';
import { evaluatePeerEnquiry } from './inquiry-policy.ts';

export const ENQUIRY_TRACE_VERSION = 'enquiry-trace-v1';
export const MAX_TRACE_CONTACTS = 32;
export type ContactTarget = 'peer' | 'leader' | 'dormitory-supervisor' | 'principal';
export type FollowUpDisposition = 'continue' | 'reported-stop' | 'not-recorded';
export interface TraceContact {
  id: string;
  target: ContactTarget;
  specificDestinationReported: boolean;
  uncertaintyReported: boolean;
  enquiryDurationSec: number | null;
  followUpDisposition: FollowUpDisposition | null;
}
export interface EnquiryTraceInput {
  provenance: 'synthetic';
  priorInformation: 'none' | 'checker-prior-authorization';
  contacts: TraceContact[];
}
export type TraceState = 'not-started' | 'skipped-on-prior-information' | 'closed-on-peer-report' |
  'follow-up-required' | 'reported-stop-after-follow-up' | 'follow-up-disposition-unknown';
type ClosureBasis = 'checker-prior-authorization' | 'first-peer-rule' | 'reported-follow-up-stop' | null;
export interface ContactEvent {
  contact: TraceContact;
  startOffsetSec: number | null;
  endOffsetSec: number | null;
  stateAfter: TraceState;
}

function record(value: unknown): value is Record<string,unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function readInput(input: unknown): EnquiryTraceInput {
  if (!record(input) || input.provenance !== 'synthetic' ||
      !['none','checker-prior-authorization'].includes(input.priorInformation as string) || !Array.isArray(input.contacts)) {
    throw new TypeError('Explicit synthetic provenance, prior-information branch and contact array are required.');
  }
  if (input.contacts.length > MAX_TRACE_CONTACTS) throw new RangeError(`At most ${MAX_TRACE_CONTACTS} contacts are supported.`);
  if (input.priorInformation === 'checker-prior-authorization' && input.contacts.length > 0) {
    throw new TypeError('The prior-information branch skips enquiries; do not attach queried contacts.');
  }
  const seen = new Set<string>();
  const contacts = input.contacts.map((value:unknown,index:number):TraceContact => {
    if (!record(value) || typeof value.id !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(value.id) || seen.has(value.id) ||
        !['peer','leader','dormitory-supervisor','principal'].includes(value.target as string) ||
        typeof value.specificDestinationReported !== 'boolean' || typeof value.uncertaintyReported !== 'boolean' ||
        !(value.enquiryDurationSec === null || typeof value.enquiryDurationSec === 'number')) {
      throw new TypeError('Contacts require unique anonymous IDs, a supported target, explicit answer flags and numeric or unknown duration.');
    }
    if (index === 0 ? value.target !== 'peer' || value.followUpDisposition !== null :
        !['continue','reported-stop','not-recorded'].includes(value.followUpDisposition as string)) {
      throw new TypeError('First contact must be a peer with null disposition; later contacts require an explicit recorded disposition.');
    }
    if (value.enquiryDurationSec !== null) finiteInRange(value.enquiryDurationSec, 'enquiryDurationSec', 0, MAX_DURATION_SEC);
    seen.add(value.id);
    return {id:value.id,target:value.target as ContactTarget,specificDestinationReported:value.specificDestinationReported,
      uncertaintyReported:value.uncertaintyReported,enquiryDurationSec:value.enquiryDurationSec,
      followUpDisposition:value.followUpDisposition as FollowUpDisposition|null};
  });
  return {provenance:'synthetic',priorInformation:input.priorInformation as EnquiryTraceInput['priorInformation'],contacts};
}

/** Sequential hypothetical contact intervals, not a validated follow-up policy or attendance decision. */
export function evaluateEnquiryTrace(input: unknown) {
  const snapshot = readInput(input);
  let state: TraceState = snapshot.priorInformation === 'checker-prior-authorization' ? 'skipped-on-prior-information' : 'not-started';
  let closureBasis: ClosureBasis = state === 'skipped-on-prior-information' ? 'checker-prior-authorization' : null;
  let elapsed: number|null = 0, knownEnquirySubtotalSec = 0, unknownDurationCount = 0;
  const events: ContactEvent[] = [];
  for (const [index,contact] of snapshot.contacts.entries()) {
    if (state === 'closed-on-peer-report' || state === 'reported-stop-after-follow-up' || state === 'follow-up-disposition-unknown') {
      throw new TypeError('A trace cannot continue after closure or an unrecorded follow-up disposition.');
    }
    const startOffsetSec = elapsed;
    if (contact.enquiryDurationSec === null) { unknownDurationCount++; elapsed = null; }
    else {
      knownEnquirySubtotalSec += contact.enquiryDurationSec;
      if (elapsed !== null) elapsed += contact.enquiryDurationSec;
    }
    if (index === 0) {
      state = evaluatePeerEnquiry({provenance:'synthetic',specificDestinationReported:contact.specificDestinationReported,
        uncertaintyReported:contact.uncertaintyReported,enquiryDurationSec:contact.enquiryDurationSec}).state;
      if (state === 'closed-on-peer-report') closureBasis = 'first-peer-rule';
    } else {
      // Later stopping criteria are unconfirmed: preserve the supplied disposition, do not infer it from the answer flags.
      state = contact.followUpDisposition === 'reported-stop' ? 'reported-stop-after-follow-up' :
        contact.followUpDisposition === 'not-recorded' ? 'follow-up-disposition-unknown' : 'follow-up-required';
      if (state === 'reported-stop-after-follow-up') closureBasis = 'reported-follow-up-stop';
    }
    events.push({contact:{...contact},startOffsetSec,endOffsetSec:elapsed,stateAfter:state});
  }
  return {
    schemaVersion:1 as const,modelVersion:ENQUIRY_TRACE_VERSION,provenance:'synthetic-policy-evaluation' as const,
    input:snapshot,events,contactCount:events.length,finalState:state,closureBasis,
    enquiryEnded:state === 'follow-up-disposition-unknown' ? null : closureBasis !== null,
    knownEnquirySubtotalSec,unknownDurationCount,enquiryTotalSec:elapsed,
    timingAssumption:'sequential-nonoverlapping-contact-intervals-only',
    excludedTime:['searching','gaps-between-contacts','prior-information-acquisition-and-handoff','scanning','rechecking'],
    priorInformationCostSec:null,wholeVerificationSec:null,
    laterStoppingRuleValidation:'not-established' as const,pathPolicyValidation:'not-established' as const,
    independentVerification:'not-established' as const,
    sources:['data/student-workflow-confirmation-2026-11-04.json','data/student-peer-stopping-rule-2026-10-31.json',
      'data/student-uncertain-followup-rule-2026-10-31.json','data/student-escalation-procedure-2026-10-31.json'],
  };
}
