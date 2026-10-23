import {sameCalendarPeriod} from './period';
import {assessCollection} from './collectionReceipts';
import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import type {GoalObligations} from '../../../kernel/src/goalObligations';
import {assessDeliverables,type Dataset} from './transforms';
/** Scope is established from verified input identities cited by output rows,
 * never from a model's assertion that a query was exhaustive. */
export function assessBoundObligation(dataset:Dataset,obligation:GoalObligations['deliverables'][number],fields:string[]){
 const gaps=assessDeliverables(dataset,[{id:obligation.id,description:obligation.description,fields,
  completeCoverage:false,knownTimeZone:obligation.timeZone!=='UNKNOWN'}])[0].gaps;
 const identities=new Set<string>();let identityGap=false;
 for(const row of dataset.rows)for(const citation of row.citations){
  const context=dataset.sourceContexts?.find(s=>s.sourceHash===citation.sourceHash&&(s.collection?.executionId??s.executionId)===citation.executionId);
  const identity=(context?.collection?.identities??context?.rowIdentities)?.[citation.row];
  if(identity===undefined)identityGap=true;else identities.add(identity);
 }
 if(obligation.scope.kind==='enumerated'){
  const expected=new Set(obligation.scope.identities);
  if(identityGap||expected.size!==identities.size||[...expected].some(id=>!identities.has(id)))gaps.push('REQUESTED_IDENTITIES_NOT_ESTABLISHED');
 }else if(obligation.scope.kind==='subset')gaps.push('REQUESTED_SUBSET_NEEDS_EXACT_IDENTITIES');
 else if(obligation.scope.kind==='population'){
  const receipts=(dataset.sourceContexts??[]).flatMap(s=>s.collection?[s.collection]:[]);
  if(!obligation.scope.query||!receipts.length||receipts.some(r=>!r.query||sha256Hex(r.query)!==sha256Hex(obligation.scope.kind==='population'?obligation.scope.query:null)))gaps.push('REQUESTED_POPULATION_QUERY_BINDING_REQUIRED');
  else {const collection=assessCollection(receipts);gaps.push(...collection.gaps.map(g=>'COLLECTION_'+g));
   if(identityGap||collection.identities.length!==identities.size||collection.identities.some(id=>!identities.has(id)))gaps.push('REQUESTED_POPULATION_ROWS_NOT_ACCOUNTED');}
 }
 else gaps.push('REQUESTED_SCOPE_UNKNOWN');
 if(!['UNKNOWN','NOT_APPLICABLE'].includes(obligation.period)&&(!dataset.sourceContexts?.length||dataset.sourceContexts.some(context=>context.period!==obligation.period&&!sameCalendarPeriod(context.period,obligation.period))))gaps.push('REQUESTED_PERIOD_NOT_ESTABLISHED');
 if(obligation.timeZone!=='UNKNOWN'&&dataset.timeZone!==obligation.timeZone)gaps.push('REQUESTED_TIME_ZONE_MISMATCH');
 // Metadata meanings are not inferred from arithmetic or prose.
 if(obligation.units!=='UNKNOWN'&&fields.some(f=>dataset.columns[f]?.kind==='decimal'&&dataset.columns[f]?.unit!==obligation.units))gaps.push('REQUESTED_UNIT_MISMATCH');
 if(obligation.vat!=='UNKNOWN'&&fields.some(f=>dataset.columns[f]?.vat!==obligation.vat))gaps.push('REQUESTED_VAT_MISMATCH');
 return {structurallyReady:gaps.length===0,gaps:[...new Set(gaps)]};
}
