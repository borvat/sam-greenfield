'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {storageFailureCode}=require('../../deploy/render-test/storageFailure.cjs');
test('authentication denial is classified without claiming expiry or renewing access',()=>{
 assert.equal(storageFailureCode({code:'28P01',message:'synthetic private connection'}),'PERSISTENT_AUTHENTICATION_DENIED');
 assert.equal(storageFailureCode({code:'28000'}),'PERSISTENT_AUTHENTICATION_DENIED');
});
test('network and known policy failures remain distinguishable',()=>{
 assert.equal(storageFailureCode({code:'ETIMEDOUT'}),'PERSISTENT_CONNECTION_UNAVAILABLE');
 assert.equal(storageFailureCode(Error('PERSISTENT_PRINCIPAL_DENIED')),'PERSISTENT_PRINCIPAL_DENIED');
});
test('arbitrary provider messages, forged codes and secret-looking errors stay redacted',()=>{
 for(const error of [undefined,null,'secret',{message:'postgres://user:synthetic@host/db'},
  {message:'PERSISTENT_SYNTHETIC_SECRET'}, {code:'secret',message:'secret'}]){
  assert.equal(storageFailureCode(error),'PERSISTENT_STORAGE_PREFLIGHT_FAILED');
 }
});
