import {AsyncLocalStorage} from 'node:async_hooks';
import type {PoolClient} from 'pg';
type Admission=(client:PoolClient)=>Promise<unknown>;
const admissions=new AsyncLocalStorage<Admission>();
/** Internal trusted runtime scope; ordinary transactions have no extra admission. */
export function withCommitAdmission<T>(admit:Admission,run:()=>Promise<T>):Promise<T>{
 if(admissions.getStore())throw Error('COMMIT_ADMISSION_ALREADY_BOUND');
 return admissions.run(admit,run);
}
export async function assertCommitAdmission(client:PoolClient){await admissions.getStore()?.(client);}
