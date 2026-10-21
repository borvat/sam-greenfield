/** One-use OAuth authorization transactions for SAM's future admin-only callback.
 * No global access or external token log. Use only behind authenticated HTTPS.
 */
import {createHash,randomBytes,timingSafeEqual} from "node:crypto";
export type OAuthTxn={stateHash:string;verifier:string;createdAt:number;redirectUri:string;ownerId?:string;clientId?:string};
export interface OAuthTxnStore {
 put(id:string,txn:OAuthTxn):Promise<void>;
 take(id:string):Promise<OAuthTxn|undefined>;
}
export function createOpaqueState():string {return randomBytes(32).toString("base64url")}
export function hashState(state:string):string{return createHash("sha256").update(state).digest("hex")}
export function sameState(expectedHash:string,candidate:string):boolean{
 const expected=Buffer.from(expectedHash,"hex");
 const actual=Buffer.from(hashState(candidate),"hex");
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export async function consumeOAuthTxn(input:{store:OAuthTxnStore;state:string;now?:number;maxAgeMs?:number}):Promise<OAuthTxn>{
 const stateHash=hashState(input.state);
 const txn=await input.store.take(stateHash);
 if(!txn||!sameState(txn.stateHash,input.state))throw new Error("OAUTH_STATE_INVALID");
 const age=(input.now??Date.now())-txn.createdAt;
 if(age<0||age>(input.maxAgeMs??600_000))throw new Error("OAUTH_STATE_EXPIRED");
 return txn;
}
export class MemoryOAuthTxnStore implements OAuthTxnStore{
 private records=new Map<string,OAuthTxn>();
 async put(id:string,txn:OAuthTxn){if(this.records.has(id))throw new Error("DUPLICATE_OAUTH_STATE");this.records.set(id,txn)}
 async take(id:string){const txn=this.records.get(id);this.records.delete(id);return txn}
}
