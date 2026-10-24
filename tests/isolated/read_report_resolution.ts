import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readReportResolution} from '../../apps/production/src/readReportResolution';
test('read receipts alone never become a partial answer; exhausted review has an explicit stop and recovery condition',()=>{
 const r=readReportResolution({status:'blocked',findings:[],requirements:[{fulfilled:false,evidenceIds:[]}],limitations:['REVIEW_MODEL_DEADLINE']});
 assert.equal(r.outcome,'blocked');assert.equal(r.automaticResume,false);assert.equal(r.disposition,'STOPPED');assert.match(r.resumeCondition!,/new authorized goal/);
});
test('validated findings with fulfilled requirements are partial, not complete',()=>{
 const r=readReportResolution({status:'blocked',findings:[{executionId:'verified'}],requirements:[{fulfilled:true,evidenceIds:['verified']},{fulfilled:false,evidenceIds:[]}],limitations:['Missing currency']});
 assert.equal(r.outcome,'partial');assert.equal(r.automaticResume,false);
});
test('projection and monetary gaps require distinct next actions without guessing facts',()=>{
 const projection=readReportResolution({status:'blocked',limitations:['REVIEW_EVIDENCE_PROJECTION_BLOCKED: essential content']});
 assert.match(projection.nextAction,/projection/);
 const monetary=readReportResolution({status:'blocked',limitations:['REVIEW_MONETARY_COVERAGE_UNPROVEN: unknown VAT']});
 assert.match(monetary.nextAction,/currency, coverage and VAT/);assert.equal(monetary.reasonCode,'REVIEW_MONETARY_COVERAGE_UNPROVEN');
});
test('follow-up plans are in progress, never stopped or automatically retried by this projection',()=>{
 const r=readReportResolution({status:'continue'});assert.equal(r.disposition,'IN_PROGRESS');assert.equal(r.outcome,'pending');
});
