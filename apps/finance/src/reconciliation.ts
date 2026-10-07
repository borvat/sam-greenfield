function strings(value:unknown):string[]{
  if(value===undefined||value===null) return [];
  if(Array.isArray(value)) return value.flatMap(strings);
  const s=String(value).trim();
  return s?[s]:[];
}

function refs(item:any):string[]{
  const candidates=[
    item?.invoiceId,item?.invoiceID,item?.invoiceNumber,item?.invoice_number,
    item?.number,item?.mutationNumber,item?.mutation_number,item?.reference,
    item?.referenceNumber,item?.reference_number,item?.description,item?.id
  ];
  return [...new Set(candidates.flatMap(strings).map((v)=>v.trim()).filter(Boolean))];
}

function items(body:any):any[]{
  for(const key of ["invoiceListItems","items","mutations","invoices"]){
    if(Array.isArray(body?.[key])) return body[key];
  }
  return [];
}

export interface ReconciliationPreview{
  matched:{reference:string;bol:any;eboekhouden:any}[];
  bolOnly:any[];
  accountingOnly:any[];
  ambiguous:{reference:string;bol:any[];eboekhouden:any[]}[];
  counts:{bol:number;accounting:number;matched:number;bolOnly:number;accountingOnly:number;ambiguous:number};
}

export function reconcileExactReferences(bolBody:any,accountingBody:any):ReconciliationPreview{
  const bol=items(bolBody);
  const accounting=items(accountingBody);
  const bMap=new Map<string,any[]>();
  const aMap=new Map<string,any[]>();

  for(const row of bol){
    for(const ref of refs(row)){
      const list=bMap.get(ref)??[]; list.push(row); bMap.set(ref,list);
    }
  }
  for(const row of accounting){
    for(const ref of refs(row)){
      const list=aMap.get(ref)??[]; list.push(row); aMap.set(ref,list);
    }
  }

  const matched:any[]=[];
  const ambiguous:any[]=[];
  const matchedBol=new Set<any>();
  const matchedAccounting=new Set<any>();
  const shared=[...bMap.keys()].filter((k)=>aMap.has(k)).sort();

  for(const reference of shared){
    const bs=[...new Set(bMap.get(reference)!)];
    const as=[...new Set(aMap.get(reference)!)];
    if(bs.length===1&&as.length===1){
      matched.push({reference,bol:bs[0],eboekhouden:as[0]});
      matchedBol.add(bs[0]); matchedAccounting.add(as[0]);
    }else{
      ambiguous.push({reference,bol:bs,eboekhouden:as});
      bs.forEach((x)=>matchedBol.add(x)); as.forEach((x)=>matchedAccounting.add(x));
    }
  }

  const bolOnly=bol.filter((x)=>!matchedBol.has(x));
  const accountingOnly=accounting.filter((x)=>!matchedAccounting.has(x));
  return {
    matched,bolOnly,accountingOnly,ambiguous,
    counts:{
      bol:bol.length,
      accounting:accounting.length,
      matched:matched.length,
      bolOnly:bolOnly.length,
      accountingOnly:accountingOnly.length,
      ambiguous:ambiguous.length
    }
  };
}

export function outstandingSnapshot(body:any){
  const rows=items(body);
  let total=0;
  let knownAmounts=0;
  for(const row of rows){
    const raw=row?.amount??row?.total??row?.amountOpen??row?.outstandingAmount;
    const n=Number(raw);
    if(Number.isFinite(n)){total+=n;knownAmounts+=1;}
  }
  return {count:rows.length,totalKnownAmount:Number(total.toFixed(2)),knownAmountRows:knownAmounts,items:rows};
}
