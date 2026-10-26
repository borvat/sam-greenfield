import {z} from 'zod';
export const CODING_OBJECTIVE='REPAIR synthetic clamp v1';
export const BROKEN_CLAMP='def clamp(value, lower, upper):\n    if lower > upper:\n        raise ValueError("invalid bounds")\n    return min(lower, max(upper, value))\n';
export const codingArtifactSchema=z.object({files:z.object({'clamp.py':z.string().min(1).max(4000)}).strict(),
  tests:z.string().min(1).max(4000),action:z.literal('run_tests')}).strict();
export function parseCodingArtifact(candidate:string){
  if(candidate.length>12000)throw Error('CODING_ARTIFACT_SIZE');
  const s=candidate.trim().replace(/^```json\s*\n([\s\S]*)\n```$/,'$1');
  return codingArtifactSchema.parse(JSON.parse(s));
}
export function codingProbe(objective:string){
  if(objective!==CODING_OBJECTIVE)throw Error('CODING_OBJECTIVE_DENIED');
  return {instructions:`You are fixing one synthetic Python project through SAM's isolated Modal artifact runner.\nSource file clamp.py:\n${BROKEN_CLAMP}\nRequirement: clamp(value, lower, upper) returns lower if value is below lower, upper if above upper, otherwise value. Raise ValueError for lower > upper. Equality is valid.\nWrite ONLY this one function, with exactly the arguments value, lower, upper. Use min/max and an if/raise for bounds. No imports, decorators, assignments, loops, recursion or other functions in clamp.py.\nWrite a separate executable Python tests string importing clamp from clamp.py and checking your repair with assertions. SAM will execute these requested tests in a non-root network-disabled Modal sandbox; SAM then independently tests the source in a fresh sandbox with immutable tests. You have no repository, GitHub, Render or credential authority.\nReturn ONLY JSON with EXACTLY these keys: {"files":{"clamp.py":"complete repaired source"},"tests":"complete executable test source","action":"run_tests"}. Do not claim verification. No markdown.`};
}
