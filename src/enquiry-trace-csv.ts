import type { evaluateEnquiryTrace } from './enquiry-trace.ts';

export type TraceExportRecord = ReturnType<typeof evaluateEnquiryTrace> & {
  generatedAt:string;sourceRevision:string|null;sourceFingerprint:string|null;
};

/** Summary plus contact rows. Each logical CSV cell is a JSON value, including null. */
export function enquiryTraceCsv(record:TraceExportRecord):string {
  const common={csv_schema_version:1,trace_schema_version:record.schemaVersion,model_version:record.modelVersion,
    provenance:record.provenance,generated_at:record.generatedAt,source_revision:record.sourceRevision,
    source_fingerprint:record.sourceFingerprint,source_authenticity:'not-verified',
    independent_verification:record.independentVerification,contact_count:record.contactCount,
    final_state:record.finalState,enquiry_ended:record.enquiryEnded,closure_basis:record.closureBasis,
    enquiry_total_sec:record.enquiryTotalSec,known_enquiry_subtotal_sec:record.knownEnquirySubtotalSec,
    unknown_duration_count:record.unknownDurationCount,prior_information_cost_sec:record.priorInformationCostSec,
    whole_verification_sec:record.wholeVerificationSec,timing_assumption:record.timingAssumption,
    excluded_time:record.excludedTime,later_stopping_rule_validation:record.laterStoppingRuleValidation,
    path_policy_validation:record.pathPolicyValidation,sources:record.sources};
  const empty={contact_id:null,target:null,specific_destination_reported:null,uncertainty_reported:null,
    enquiry_duration_sec:null,follow_up_disposition:null,start_offset_sec:null,end_offset_sec:null,state_after:null};
  const rows=[{record_type:'summary',...common,...empty,input:record.input},...record.events.map(event=>({
    record_type:'contact',...common,contact_id:event.contact.id,target:event.contact.target,
    specific_destination_reported:event.contact.specificDestinationReported,uncertainty_reported:event.contact.uncertaintyReported,
    enquiry_duration_sec:event.contact.enquiryDurationSec,follow_up_disposition:event.contact.followUpDisposition,
    start_offset_sec:event.startOffsetSec,end_offset_sec:event.endOffsetSec,state_after:event.stateAfter,input:null}))];
  // A JSON-quoted text value cannot begin with a spreadsheet formula marker.
  const cell=(value:unknown)=>'"'+JSON.stringify(value).replaceAll('"','""')+'"';
  return Object.keys(rows[0]!).join(',')+'\r\n'+rows.map(row=>Object.values(row).map(cell).join(',')).join('\r\n')+'\r\n';
}
