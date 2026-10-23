import type {DerivedArtifact} from '../../brain/src/evidence/artifacts';
/** A cell quotation binds identity, row, field and value, not merely a repeated scalar. */
export function derivedCellQuote(artifact:DerivedArtifact,row:number,field:string){
 return JSON.stringify({artifactId:artifact.artifactId,outputHash:artifact.output.outputHash,row,field,value:artifact.output.dataset.rows[row]?.values[field]});
}
export function derivedReviewText(artifact:DerivedArtifact,limit=Infinity,preferredFields:string[]=[]){
 const d=artifact.output.dataset;
 const metadata={artifactId:artifact.artifactId,outputHash:artifact.output.outputHash,columns:d.columns,coverage:d.coverage,timeZone:d.timeZone,limitations:d.limitations,selections:d.selections??[],sourceContexts:d.sourceContexts??[]};
 const lines=[JSON.stringify(metadata)];let used=lines[0].length,omitted=0;
 if(used+200>limit)throw Error('REVIEW_ESSENTIAL_EVIDENCE_TOO_LARGE');
 const cells=d.rows.flatMap((record,row)=>Object.keys(record.values).map(field=>({row,field})));
 if(preferredFields.length)cells.sort((a,b)=>{const priority=(field:string)=>preferredFields.includes(field)?preferredFields.indexOf(field):preferredFields.length;return priority(a.field)-priority(b.field)||a.row-b.row;});
 for(const {row,field} of cells){
  const quote=derivedCellQuote(artifact,row,field);
  // Long cells are explicit omissions, never split into ambiguous partial quotes.
  if(quote.length>1000||used+quote.length+201>limit){omitted++;continue;}
  lines.push(quote);used+=quote.length+1;
 }
 if(omitted)lines.push(JSON.stringify({omittedCells:omitted,limitation:'Derived cells omitted by review budget; no full-detail claim'}));
 return {text:lines.join('\n'),omitted,quotes:lines.slice(1,omitted?-1:undefined)};
}
