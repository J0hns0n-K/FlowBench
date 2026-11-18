import { evaluateEnquiryTrace, ENQUIRY_TRACE_VERSION } from './enquiry-trace.ts';

/** Internal consistency only: neither an authentic-source check nor field verification. */
export function replayEnquiryTrace(text: string) {
  if(typeof text!=='string'||text.length>200000)throw new TypeError('A JSON record of at most 200000 characters is required.');
  const stored:unknown=JSON.parse(text);
  if(!stored||typeof stored!=='object'||Array.isArray(stored))throw new TypeError('A trace record is required.');
  const record=stored as Record<string,unknown>;
  if(record.schemaVersion!==1||record.modelVersion!==ENQUIRY_TRACE_VERSION||record.provenance!=='synthetic-policy-evaluation') {
    throw new TypeError('Unsupported trace version or provenance.');
  }
  const recomputed=evaluateEnquiryTrace(record.input);
  const canonical=(value:unknown):string=>{
    if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
    if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b))
      .map(([key,item])=>JSON.stringify(key)+':'+canonical(item)).join(',')+'}';
    return JSON.stringify(value)??'undefined';
  };
  const mismatchedFields=Object.keys(recomputed).filter(key=>
    canonical(record[key])!==canonical(recomputed[key as keyof typeof recomputed]));
  return {replayVersion:'enquiry-trace-replay-v1',recomputed,matchesStoredCalculation:mismatchedFields.length===0,
    mismatchedFields,sourceAuthenticity:'not-verified',independentVerification:'not-established'} as const;
}
