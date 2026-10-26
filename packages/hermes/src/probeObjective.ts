/** The live acceptance probe has an explicit finite grammar, not a general planner. */
export function sumProbe(objective:string){
  const m=/^SUM (-?\d{1,5}) (-?\d{1,5})$/.exec(objective);
  if(!m||m.slice(1).some(v=>Math.abs(Number(v))>10000))throw Error('HERMES_PROBE_OBJECTIVE_DENIED');
  return {a:Number(m[1]),b:Number(m[2]),instructions:`Calculate ${m[1]} + ${m[2]}. Return ONLY the integer result. No explanation, markdown or tools.`};
}
