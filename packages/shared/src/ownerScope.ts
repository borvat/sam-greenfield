/** Trusted server identity plus the connection's fixed tenant; never caller-supplied tenant JSON. */
export interface OwnerContext {actor:string;systemOwner:boolean;legalEntityId?:string}
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function authorizedCompany(client:any,context:OwnerContext):Promise<string>{
 if(context.systemOwner!==true||typeof context.actor!=='string'||!context.actor.trim()||context.actor.length>200)throw Error('AUTHORIZED_COMPANY_CONTEXT_REQUIRED');
 const principal=(await client.query('SELECT current_org_id() AS org,current_legal_entity_id() AS entity')).rows[0];
 const requested=context.legalEntityId??process.env.SAM_DEFAULT_LEGAL_ENTITY_ID??process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID??principal?.entity;
 if(!uuidPattern.test(principal?.org??'')||!uuidPattern.test(principal?.entity??'')||requested!==principal.entity)throw Error('AUTHORIZED_COMPANY_CONTEXT_REQUIRED');
 if(!(await client.query('SELECT id FROM legal_entities WHERE id=$1 AND org_id=$2',[principal.entity,principal.org])).rowCount)throw Error('AUTHORIZED_COMPANY_CONTEXT_REQUIRED');
 return principal.entity;
}
