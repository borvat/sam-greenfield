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

import Ajv from 'ajv';
test('AJV equivalence preserves literal consts, property maps, patterns, not and references',()=>{
 const literal={a:'repeated-literal-value'.repeat(8),b:3};
 const fields={alpha:{type:'string',pattern:'^[a-z]+$'},beta:{type:'integer',not:{const:7}},longAnnotation:{const:'annotation'.repeat(15)}};
 const schemas=[
  {type:'object',properties:Object.fromEntries(['a','b','c'].map(k=>[k,{const:literal}])),required:['a','b','c']},
  {type:'object',properties:Object.fromEntries(['a','b','c'].map(k=>[k,{type:'object',properties:fields,required:['alpha','beta'],additionalProperties:false}]))},
  {type:'object',patternProperties:{'^x':{not:{type:'number'}}},additionalProperties:false},
  {$defs:{literal:{const:literal}},type:'object',properties:{x:{$ref:'#/$defs/literal'}}},
  {type:'object',properties:{x:{not:{const:literal}}},examples:[literal,literal,literal]}
 ];
 const samples=[null,{},7,'x',{a:literal,b:literal,c:literal},{a:{...literal,b:4},b:literal,c:literal},
  {a:{alpha:'abc',beta:2},b:{alpha:'z',beta:3},c:{alpha:'one',beta:4}},
  {a:{alpha:'BAD',beta:7}},{x:literal},{x:7},{x:'abc'},{extra:true}];
 for(const schema of schemas){const ajv=new Ajv({strict:false}),original=ajv.compile(schema),compacted=ajv.compile(compactSchema(schema));for(const sample of samples)assert.equal(compacted(sample),original(sample),JSON.stringify({schema,sample}));}
});
