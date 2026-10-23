import assert from 'node:assert/strict';
import {z} from 'zod';
/** Independently transcribed transport-used wire shapes, NOT a whole-API schema.
 * Endpoint OpenAPI: https://api-docs.render.com/openapi/render-public-api-1.json
 * Cross-check: render-oss/cli 7129791ee688c7fb0622bef2f571298c1b682e9c,
 * pkg/client/{types_gen.go,client_gen.go}. Full provenance in the audit document.
 */
const time=z.string().datetime({offset:true});
const link=z.object({id:z.string(),name:z.string(),type:z.enum(['cron','pserv','static','web','worker'])});
export const envGroupMeta=z.object({id:z.string(),name:z.string(),ownerId:z.string(),createdAt:time,updatedAt:time,serviceLinks:z.array(link),environmentId:z.string().optional()});
const env=z.object({key:z.string(),value:z.string()}),file=z.object({name:z.string(),content:z.string()});
const deploy=z.object({id:z.string(),commit:z.object({id:z.string().optional(),message:z.string().optional(),createdAt:time.optional()}).optional(),status:z.enum(['created','queued','build_in_progress','update_in_progress','live','deactivated','build_failed','update_failed','canceled','pre_deploy_in_progress','pre_deploy_failed']).optional()});
const service=z.object({id:z.string(),name:z.string(),ownerId:z.string(),autoDeploy:z.enum(['yes','no']),autoDeployTrigger:z.enum(['commit','checksPass','off']).optional(),createdAt:time,updatedAt:time,dashboardUrl:z.string(),notifyOnFail:z.string(),rootDir:z.string(),slug:z.string(),suspended:z.enum(['suspended','not_suspended']),suspenders:z.array(z.string()),type:z.string(),serviceDetails:z.record(z.string(),z.unknown())});
/** Assert request and success response contracts before the simulated API sends
 * them. Operational requirements (live commit, scope, drift) remain in transport.
 * Explicit fault responses and injected generic pagination alternatives are
 * validated in their dedicated tests, not passed off as endpoint OpenAPI data.
 */
export function assertOfficialWire(method:string,path:string,status:number,body:unknown,response:unknown){
 if(status>=400)return;
 const cell=path.match(/^\/(env-vars|secret-files)\/.+$/);
 if(path==='/groups') {assert.equal(method,'GET');assert.equal(status,200);z.array(envGroupMeta).parse(response);return;}
 if(cell){
  const schema=cell[1]==='env-vars'?env:file;
  if(method==='GET'){assert.equal(status,200);schema.parse(response);return;}
  if(method==='PUT'){assert.equal(status,cell[1]==='env-vars'?200:201);(cell[1]==='env-vars'?z.object({value:z.string()}).strict():z.object({content:z.string()}).strict()).parse(body);schema.parse(response);return;}
  assert.equal(method,'DELETE');assert.equal(status,204);assert.equal(response,undefined);return;
 }
 if(path==='/env-vars'||path==='/secret-files'){
  assert.equal(method,'GET');assert.equal(status,200);z.array(path==='/env-vars'?z.object({envVar:env,cursor:z.string()}):z.object({secretFile:file,cursor:z.string()})).parse(response);return;
 }
 if(path==='/instances'){assert.equal(method,'GET');assert.equal(status,200);z.array(z.object({id:z.string(),createdAt:time})).parse(response);return;}
 if(path==='/suspend'||path==='/resume'){assert.equal(method,'POST');assert.equal(status,202);assert.equal(body,undefined);assert.equal(response,undefined);return;}
 if(path==='/deploys'||path==='/rollback'){
  if(method==='GET'){assert.equal(path,'/deploys');assert.equal(status,200);z.array(z.object({deploy:deploy.optional(),cursor:z.string().optional()})).parse(response);return;}
  assert.equal(method,'POST');(path==='/deploys'?z.object({buildId:z.string()}).strict():z.object({deployId:z.string()}).strict()).parse(body);if(status===202){assert.equal(path,'/deploys');assert.equal(response,undefined);}else{assert.equal(status,201);deploy.parse(response);}return;
 }
 assert.equal(path,'');assert.equal(method,'GET');assert.equal(status,200);service.parse(response);
}
