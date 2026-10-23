import {taskPrompt} from '../../../packages/model-providers/src/common';
// Character allocation controls evidence projection; UTF-8 bytes bound the entire
// serialized provider task prompt, including its wrapper, schemas, provenance, history and critique.
// Neither unit is a model token count or a guarantee of provider latency.
export const REVIEW_EVIDENCE_CHARS=16000;
export const REVIEW_INPUT_BYTES=48000;
export function reviewSourceAllowance(sourceCount:number){
 if(!Number.isSafeInteger(sourceCount)||sourceCount<1||sourceCount>20)throw Error('REVIEW_SOURCE_BUDGET_EXCEEDED');
 return Math.floor(REVIEW_EVIDENCE_CHARS/sourceCount);
}
export function assertReviewInputBudget(input:unknown){
 const bytes=Buffer.byteLength(taskPrompt({task:'executive_planning',capability:'planning',input,dataClassification:'INTERNAL'}),'utf8');
 if(bytes>REVIEW_INPUT_BYTES)throw Error('REVIEW_INPUT_BUDGET_EXCEEDED');
 return bytes;
}
