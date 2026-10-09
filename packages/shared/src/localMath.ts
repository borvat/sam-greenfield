// Existing local arithmetic, shared without sandbox identity or provider transport.
// Callers retain their own parameter, authority and tenant checks.
export function calculateLocal(values:number[],operation:string){
  const sum=values.reduce((a,b)=>a+b,0);
  const result=operation==="sum"?sum:operation==="mean"?sum/values.length:
    operation==="min"?Math.min(...values):operation==="max"?Math.max(...values):values.length;
  if(!Number.isFinite(result))throw new Error("LOCAL_NONFINITE_RESULT");
  return result;
}

// Independent SQL algorithm: never calls the executor's calculation routine.
// Values are bound, never SQL identifiers or SQL fragments.
export async function independentLocalAggregates(client:{query:(sql:string,values:any[])=>Promise<any>},values:number[]){
  return (await client.query(`SELECT sum(v)::double precision AS sum,avg(v)::double precision AS mean,
    min(v)::double precision AS min,max(v)::double precision AS max,count(*)::int AS count
    FROM unnest($1::double precision[]) AS v`,[values])).rows[0];
}
