/** AES-256-GCM envelope encryption for SAM-only MCP OAuth tokens.
 * Key must be a 32-byte random secret, base64 encoded, stored in Render secrets.
 * Never reuse GOOGLE_OAUTH_REFRESH_TOKEN or other legacy Google credentials.
 */
import {createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
export function parseSamGoogleEncryptionKey(encoded:string):Buffer {
 const key=Buffer.from(encoded||"","base64");
 if(key.length!==32||!encoded||key.toString("base64")!==encoded)throw new Error("SAM_GOOGLE_ENCRYPTION_KEY_INVALID");
 return key;
}
export function sealSamGoogleToken(value:string,key:Buffer,context:string):string {
 if(!context||!value||key.length!==32)throw new Error("TOKEN_ENCRYPTION_ARGUMENT_INVALID");
 const iv=randomBytes(12);
 const cipher=createCipheriv("aes-256-gcm",key,iv);
 cipher.setAAD(Buffer.from(context,"utf8"));
 const ciphertext=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
 return ["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),ciphertext.toString("base64url")].join(".");
}
export function openSamGoogleToken(envelope:string,key:Buffer,context:string):string {
 if(!context||key.length!==32)throw new Error("TOKEN_DECRYPTION_ARGUMENT_INVALID");
 try {
  const [version,iv64,tag64,data64,...extra]=envelope.split(".");
  if(version!=="v1"||extra.length)throw Error();
  const iv=Buffer.from(iv64,"base64url"),tag=Buffer.from(tag64,"base64url");
  if(iv.length!==12||tag.length!==16)throw Error();
  const decipher=createDecipheriv("aes-256-gcm",key,iv);
  decipher.setAAD(Buffer.from(context,"utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(Buffer.from(data64,"base64url")),decipher.final()]).toString("utf8");
 }catch{throw new Error("SAM_GOOGLE_TOKEN_DECRYPT_FAILED")}
}
