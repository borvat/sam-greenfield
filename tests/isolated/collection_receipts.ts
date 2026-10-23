import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectionReceipt,assessCollection} from '../../apps/brain/src/evidence/collectionReceipts';
const contract={cursorParameter:'cursor',nextCursorPath:['page','next'],identityPath:['id']};
const page=(id:string,cursor:string|null,next:string|null,ids:string[],filter='supplied')=>collectionReceipt({id,execution_hash:id.repeat(64),capability_id:'read.records',params:{filter,cursor},result:{page:{next}}},ids.map(id=>({id})),contract);
test('collection receipts require an exact connected terminal query, independent of page order',()=>{
 const a=page('a',null,'next',['one']),b=page('b','next',null,['two']);
 assert.equal(assessCollection([b,a]).complete,true);
 assert.deepEqual(assessCollection([a,b]),assessCollection([b,a]));
 assert.equal(assessCollection([a]).complete,false);
 for(const bad of [[a,page('b','next',null,['one'])],[a,page('b','next',null,['two'],'other')],[a,page('b','next','next',['two'])],[a,page('b','unused',null,['two'])]])assert.equal(assessCollection(bad).complete,false);
});
test('missing pagination and unreviewed identities cannot become completion receipts',()=>{
 assert.throws(()=>collectionReceipt({id:'a',execution_hash:'f'.repeat(64),capability_id:'read.records',params:{},result:{page:{}}},[],contract),/METADATA_MISSING/);
 assert.throws(()=>collectionReceipt({id:'a',execution_hash:'f'.repeat(64),capability_id:'read.records',params:{},result:{page:{next:null}}},[{invented:'x'}],contract),/METADATA_MISSING/);
 assert.equal(assessCollection([page('a',null,null,[])]).complete,true,'explicit terminal empty collection is distinct from absent source');
});
