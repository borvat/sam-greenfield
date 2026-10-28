const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {readFileSync}=require('node:fs');
const {test}=require('node:test');
const {migrationPacket,applyReviewedMigration,operatorConfig}=require('../../scripts/release/review-revision-operator.cjs');
const hash=createHash('sha256').update(readFileSync('packages/db/integration-migrations/00106_read_review_revisions.sql')).digest('hex');
test('operator accepts exact reviewed SQL only',()=>{assert.equal(migrationPacket(process.cwd(),hash).sha256,hash);assert.throws(()=>migrationPacket(process.cwd(),'a'.repeat(64)),/HASH_MISMATCH/);assert.throws(()=>migrationPacket(process.cwd(),'bad'),/HASH_REQUIRED/);});
function client({operator='sam_trial_postgres_user',prior,changed=false,owner=operator}={}){
 const queries=[];let snapshots=0;
 return {queries,async query(sql,args){queries.push(sql);if(sql.startsWith('SELECT current_user'))return {rows:[{operator,database:'sam_trial_postgres'}]};if(sql.startsWith('SELECT sha256'))return {rows:prior?[{sha256:prior}]:[]};if(sql.startsWith('SELECT pg_get_userbyid'))return {rows:[{owner}]};if(sql.includes('c.relrowsecurity'))return {rows:[{acl:changed&&++snapshots>1?'changed':'unchanged'}]};return {rows:[]};}};
}
test('operator migration commits once and exact retry does not execute SQL',async()=>{const c=client();assert.equal((await applyReviewedMigration(c,migrationPacket(process.cwd(),hash))).status,'APPLIED');assert.equal(c.queries.filter(q=>q.startsWith('-- Keep the original')).length,1);assert(c.queries.includes('COMMIT'));const replay=client({prior:hash});assert.equal((await applyReviewedMigration(replay,migrationPacket(process.cwd(),hash))).status,'ALREADY_APPLIED');assert(!replay.queries.some(q=>q.startsWith('-- Keep the original')));});
test('wrong principal, hash conflict or permission delta fails closed',async()=>{await assert.rejects(applyReviewedMigration(client({operator:'sam_runtime_app'}),{sql:'forbidden',sha256:hash}),/EXISTING_OPERATOR/);for(const scenario of [{prior:'conflict'},{changed:true},{owner:'other'}]){const c=client(scenario);await assert.rejects(applyReviewedMigration(c,migrationPacket(process.cwd(),hash)));assert(c.queries.includes('ROLLBACK'));assert(!c.queries.includes('COMMIT'));}});

test('existing complex credentials survive driver URL parsing without disclosure',()=>{const {parse}=require('pg-connection-string');for(const synthetic of ['fixture%40','fixture@:/%?# +é']){const u=new URL('postgres://old:old@dpg-db37k3rbc2fs73csjung-a/sam_trial_postgres');const config=operatorConfig(u,synthetic);assert.equal(parse(config.connectionString).password,synthetic);}});
