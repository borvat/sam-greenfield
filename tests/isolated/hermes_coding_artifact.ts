import test from 'node:test';
import assert from 'node:assert/strict';
import {codingProbe,parseCodingArtifact,BROKEN_CLAMP,CODING_OBJECTIVE} from '../../packages/hermes/src/codingProbe';
const artifact={files:{'clamp.py':BROKEN_CLAMP},tests:'assert True',action:'run_tests'};
test('coding objective permits one synthetic repair only',()=>{
 assert.match(codingProbe(CODING_OBJECTIVE).instructions,/fresh sandbox/);assert.throws(()=>codingProbe('REPAIR production'));
});
test('coding artifact admits fixed source and tests, including a JSON fence',()=>{
 assert.deepEqual(parseCodingArtifact(JSON.stringify(artifact)),artifact);
 assert.deepEqual(parseCodingArtifact('```json\n'+JSON.stringify(artifact)+'\n```'),artifact);
});
test('coding artifacts reject traversal, extra files, tools, secrets and excess payloads',()=>{
 for(const x of [{...artifact,files:{'../clamp.py':'x'}},{...artifact,files:{...artifact.files,'extra.py':'x'}},{...artifact,command:'ls'},{...artifact,token:'secret'},{...artifact,tests:''},{...artifact,action:'terminal'}])assert.throws(()=>parseCodingArtifact(JSON.stringify(x)));
 assert.throws(()=>parseCodingArtifact('x'.repeat(12001)));
});
