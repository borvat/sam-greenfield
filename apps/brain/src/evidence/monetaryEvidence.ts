import {assessBoundObligation} from './fulfillment';
import {isMonetaryColumn,type Dataset} from './transforms';
import type {GoalObligations} from '../../../kernel/src/goalObligations';
import {calendarPeriod,sameCalendarPeriod} from './period';
/** A shared completion contract for attributed structured reports and replayed
 * derivations. Callers establish verification, citation and scope independently. */
export type MonetaryEvidence={amounts:unknown[];currency:unknown;vat:unknown;period:unknown;coverageEstablished:boolean;scopeGaps?:string[]};
const object=(v:any):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function monetaryRequest(objective:string){
 if(!/\bsales\b|\borders\b|bol\.com|omzet|مبيعات|طلبات/i.test(objective)||! /\b(EUR|VAT|BTW|revenue|turnover|omzet)\b|€|يورو|ضريبة|إيراد/i.test(objective))return;
 const dates=[...new Set(objective.match(/\b\d{4}-\d{2}-\d{2}\b/g)??[])].sort();
 return {currency:'EUR',period:dates.length?calendarPeriod({startDate:dates[0],endDate:dates.at(-1)}):undefined};
}
export function assessMonetaryEvidence(e:MonetaryEvidence,request:{currency:string;period:unknown}){
 const gaps=[...(e.scopeGaps??[])];
 if(!e.amounts.length||e.amounts.some(v=>typeof v==='number'?!Number.isFinite(v)||Math.abs(v)>Number.MAX_SAFE_INTEGER:typeof v!=='string'||! /^-?(0|[1-9]\d{0,29})(\.\d{1,12})?$/.test(v)))gaps.push('MONETARY_AMOUNT_UNPROVEN');
 if(e.currency!==request.currency)gaps.push('MONETARY_CURRENCY_UNPROVEN');
 const vat=e.vat;const known=typeof vat==='string'&&/^(inclusive|exclusive|included|excluded|gross|net|mixed|including VAT|excluding VAT)$/i.test(vat)||object(vat)&&(typeof vat.included==='boolean'||typeof vat.basis==='string'&&/^(inclusive|exclusive|included|excluded)$/i.test(vat.basis));
 if(!known)gaps.push('MONETARY_VAT_UNPROVEN');
 if(!sameCalendarPeriod(e.period,request.period))gaps.push('MONETARY_PERIOD_UNPROVEN');
 if(!e.coverageEstablished)gaps.push('MONETARY_COVERAGE_UNPROVEN');
 return {supported:gaps.length===0,gaps:[...new Set(gaps)]};
}
export function reportMonetaryEvidence(s:{capabilityId:string;data?:any}):MonetaryEvidence|undefined{
 if(/invoice|factuur|فاتور/i.test(s.capabilityId))return;
 const r=s.data?.report??s.data?.result?.report??s.data;if(!object(r))return;
 const totals=r.totals??r,coverage=r.coverage;
 return {amounts:['revenue','grossSales','netSales','salesAmount','totalAmount'].filter(k=>typeof totals[k]==='number').map(k=>totals[k]),currency:r.currency??totals.currency,vat:r.vat??r.vatStatus??r.taxBasis??totals.vat??totals.vatStatus??totals.taxBasis,period:r.period,
  coverageEstablished:object(coverage)&&(coverage.complete===true||coverage.pagination==='every requested collection reached an empty terminal page')&&coverage.truncated!==true};
}
export const MONETARY_GAP='REVIEW_MONETARY_COVERAGE_UNPROVEN: requested-period sales amount, EUR currency and explicit VAT basis are not established together by verified structured or replayed evidence. Settlement invoices do not establish daily revenue. Obtain authorized monetary evidence and complete requested scope; do not invent aggregates.';
export function monetaryCompletionLimitations(objective:string,evidence:MonetaryEvidence[]){const request=monetaryRequest(objective);if(!request)return [];return evidence.some(e=>assessMonetaryEvidence(e,request).supported)?[]:[MONETARY_GAP];}

/** Only replayed, cited output cells reach this adapter. Reviewed field semantics
 * distinguish customer charges from settlement invoices/commission. */
export function derivedMonetaryEvidence(dataset:Dataset,bound:GoalObligations['deliverables'][number],fields:string[]):MonetaryEvidence[]{
 const scope=assessBoundObligation(dataset,bound,bound.fields);
 const contexts=dataset.sourceContexts??[],period=contexts[0]?.period;
 return fields.filter(field=>bound.fields.includes(field)&&dataset.columns[field]&&isMonetaryColumn(dataset.columns[field])).map(field=>{
  const column=dataset.columns[field];return {amounts:dataset.rows.map(r=>r.values[field]),currency:column.unit,vat:column.vat,period,
   coverageEstablished:scope.structurallyReady&&column.monetaryMeaning==='customer-charge'&&contexts.length>0&&contexts.every(c=>sameCalendarPeriod(c.period,period)),
   scopeGaps:scope.gaps};
 });
}
