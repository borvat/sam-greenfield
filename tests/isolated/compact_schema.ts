import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compactSchema} from '../../apps/production/src/compactSchema';
import {DERIVE_PARAMETERS} from '../../apps/brain/src/evidence/planSchema';
import {validateParameters} from '../../packages/tool-gateway/src/validation';
test('compact schemas retain the full operation grammar and identifier restrictions',()=>{
 const compact=compactSchema(DERIVE_PARAMETERS);
 assert(JSON.stringify(compact).length<JSON.stringify(DERIVE_PARAMETERS).length-1400);
 const source={s:{executionId:'11111111-1111-4111-8111-111111111111',contractId:'versioned-v1'}};
 for(const operation of [{op:'save',as:'a'},{op:'from',source:'s'},{op:'select',fields:{x:'x'}},{op:'filter',field:'x',compare:'eq',value:'2'},
  {op:'derive',as:'a',left:'x',right:'y',operator:'add'},{op:'group',keys:['x'],aggregates:[{fn:'count',as:'n'},{fn:'sum',field:'y',as:'sum'}]},
  {op:'join',right:'s',leftKey:'x',rightKey:'x',kind:'inner'},{op:'union',right:'s'},{op:'distinct',keys:['x']},
  {op:'derive',as:'constructor',left:'x',right:'y',operator:'add'},{op:'join',right:'s'},{op:'unknown'}]){
  const proposal={sources:source,plan:{version:1,source:'s',operations:[operation]}};
  const valid=(schema:any)=>{try{validateParameters(schema,proposal);return true;}catch{return false;}};
  assert.equal(valid(compact),valid(DERIVE_PARAMETERS),JSON.stringify(operation));
 }
 const withRefs={$defs:{x:{type:'string'}},properties:{x:{$ref:'#/$defs/x'}}};assert.equal(compactSchema(withRefs),withRefs);
});
