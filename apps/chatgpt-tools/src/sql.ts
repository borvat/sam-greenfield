import { pool } from "../../../packages/db/src/client";

export function clampLimit(value:unknown,defaultValue=50,max=200):number{
  if(value===undefined||value===null) return defaultValue;
  const n=Number(value);
  if(!Number.isInteger(n)||n<=0) throw new Error("limit must be a positive integer");
  return Math.min(n,max);
}

export async function rows(sql:string,params:any[]=[]){
  const result=await pool.query(sql,params);
  return result.rows;
}

export async function one(sql:string,params:any[]=[]){
  const result=await pool.query(sql,params);
  return result.rows[0] ?? null;
}
