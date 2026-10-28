import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {DiagnosticBinding} from './legacyReadDiagnostic';

/** Artifact gate, separate from report generation. Accepts only the narrow,
 * sanitized diagnostic shape and refuses completion/coverage/provider claims. */
export function validateLegacyDiagnosticReport(value:any,binding:DiagnosticBinding):true{
 const check=(condition:unknown)=>{if(!condition)throw Error('LEGACY_DIAGNOSTIC_REPORT_REJECTED')};
 const keys=(object:any,expected:string[])=>object&&typeof object==='object'&&!Array.isArray(object)&&Object.keys(object).sort().join('|')===[...expected].sort().join('|');
 check(keys(value,['status','summary','requirements','findings','limitations','steps','diagnostic','report']));
 check(value.status==='complete'&&typeof value.summary==='string'&&value.summary.length>30&&value.summary.length<=1500&&Array.isArray(value.steps)&&value.steps.length===0);
 check(keys(value.report,['semanticPolicy'])&&value.report.semanticPolicy==='DETERMINISTIC_BOUNDED_SAVED_EVIDENCE');
 check(Array.isArray(value.requirements)&&value.requirements.length===1);
 const requirement=value.requirements[0];check(keys(requirement,['requirement','fulfilled','evidenceIds'])&&typeof requirement.requirement==='string'&&requirement.fulfilled===true&&sha256Hex(requirement.evidenceIds)===sha256Hex(binding.executions.map(e=>e.id)));
 const d=value.diagnostic;
 check(keys(d,['schema','authorization','bindingHash','mode','originalGoalCompleted','mailboxExhaustiveness','mailboxIdentity','exactWindowCoverage','pages','modelCalls','newReads']));
 check(d.schema==='sam.legacy_read_diagnostic.v1'&&d.authorization===binding.authorization&&d.bindingHash===sha256Hex(binding)&&d.mode==='DETERMINISTIC_SAVED_VERIFIED_EVIDENCE_ONLY');
 check(d.originalGoalCompleted===false&&d.mailboxIdentity==='UNKNOWN'&&d.mailboxExhaustiveness==='UNKNOWN'&&d.exactWindowCoverage==='UNKNOWN'&&d.modelCalls===0&&d.newReads===0);
 check(Array.isArray(d.pages)&&d.pages.length===2&&Array.isArray(value.findings)&&value.findings.length===2);
 for(const [i,expected] of binding.executions.entries()){
  const p=d.pages[i],f=value.findings[i];
  check(keys(p,['direction','readSucceeded','uniqueIdentifierCount','pageSize','pagination','exhaustive','executionId','verificationId','resultHash','retrievedAt','verifiedAt']));
  check(p.direction===expected.direction&&p.readSucceeded===true&&p.uniqueIdentifierCount===expected.count&&Number.isInteger(p.uniqueIdentifierCount)&&p.uniqueIdentifierCount>=0&&p.uniqueIdentifierCount<=100&&p.pageSize===100);
  check(p.pagination==='NOT_EXPOSED'&&p.exhaustive==='UNKNOWN'&&p.executionId===expected.id&&p.verificationId===expected.verificationId&&p.resultHash===expected.resultHash&&p.retrievedAt===expected.retrievedAt&&p.verifiedAt===expected.verifiedAt);
  check(keys(f,['text','executionId','verificationId'])&&f.executionId===expected.id&&f.verificationId===expected.verificationId&&f.text===`${expected.direction}: verified saved page contains ${expected.count} unique identifiers; pagination is not exposed.`);
 }
 check(Array.isArray(value.limitations)&&value.limitations.length>=7&&value.limitations.every((s:any)=>typeof s==='string'));
 for(const required of ['Pagination tokens are not exposed','Counts are not mailbox totals','millisecond window','No message bodies','original broader objective','in:inbox only','Mailbox identity is unknown'])check(value.limitations.some((s:string)=>s.includes(required)));
 // Source IDs/links or arbitrary extra source material cannot enter this artifact.
 check(!/https?:\/\/|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(JSON.stringify(value)));
 return true;
}
