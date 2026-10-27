import {test} from "node:test";
import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
import {parseSamGoogleEncryptionKey,sealSamGoogleToken,openSamGoogleToken} from "../../apps/production/src/samGoogleTokenCrypto";
test("seals and opens SAM-only token with stable context",()=>{
 const key=parseSamGoogleEncryptionKey(randomBytes(32).toString("base64"));
 const encrypted=sealSamGoogleToken("private-refresh-token",key,"surooh:sam-google");
 assert.notEqual(encrypted,"private-refresh-token");
 assert.equal(openSamGoogleToken(encrypted,key,"surooh:sam-google"),"private-refresh-token");
 assert.throws(()=>openSamGoogleToken(encrypted,key,"different-entity"),/DECRYPT_FAILED/);
});
test("rejects weak encryption keys and tampered ciphertext",()=>{
 assert.throws(()=>parseSamGoogleEncryptionKey("secret"),/KEY_INVALID/);
 const key=randomBytes(32),encrypted=sealSamGoogleToken("token",key,"actor");
 const corrupted=encrypted.slice(0,-2)+"zz";
 assert.throws(()=>openSamGoogleToken(corrupted,key,"actor"),/DECRYPT_FAILED/);
});
