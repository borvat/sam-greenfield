/** Callers own a transaction so proposal transitions and audit evidence commit together. */
import {sha256Hex} from '../../../packages/shared/src/stableJson';
import type {PoolClient} from 'pg';
import {authorizedCompany,uuidPattern,type OwnerContext} from '../../../packages/shared/src/ownerScope';
import {companyProfile} from './company';
export const SKILL_REVIEW_CHECKS=['source','license','dependencies','secrets','isolation','evaluation'] as const;
async function recordSkillEvent(c:PoolClient,company:string,actor:string,action:string,row:any,previous?:any){
 const pin=(value:any)=>value?{commit:value.source_commit,hash:value.source_hash,state:value.state,reviewedBy:value.reviewed_by,adoptedBy:value.adopted_by,reviewHash:value.review?sha256Hex(value.review):null}:null;
 await c.query(`INSERT INTO audit_log(actor,action,entity_type,entity_id,after_ref,source,authority_class,result)
  VALUES($1,$2,'legal_entity',$3,$4::jsonb,'company_skill_workflow','GREEN',$5)`,[actor,action,company,JSON.stringify({schema:'sam.skill_transition.v1',proposalId:row.id,profileId:row.profile_id,previous:pin(previous),current:pin(row),executionPerformed:false}),row.state]);
}
export async function companySkillStatus(c:PoolClient,company:string){
 if(!(await c.query("SELECT to_regclass('company_skill_proposals') IS NOT NULL ready")).rows[0].ready)return [];
 return (await c.query(`SELECT id,profile_id,source_url,source_commit,source_hash,state,reviewed_by,reviewed_hash,adopted_by,rollback_ref,updated_at
  FROM company_skill_proposals WHERE legal_entity_id=$1 ORDER BY updated_at DESC,id DESC LIMIT 100`,[company])).rows.map(row=>({...row,execution:'NOT_INSTALLED',reviewCurrent:row.reviewed_hash===row.source_hash&&['REVIEWED','ADOPTED'].includes(row.state)}));
}

export async function proposeCompanySkill(c:PoolClient,context:OwnerContext,input:{profileId:string;sourceUrl:string;commit:string;hash:string;rollbackRef:string}){
 const company=await authorizedCompany(c,context);companyProfile(input.profileId);
 const url=new URL(input.sourceUrl);
 if(url.protocol!=='https:'||url.hostname!=='github.com'||url.username||url.password||url.search||url.hash||!/^\/[\w.-]+\/[\w.-]+(?:\/.*)?$/.test(url.pathname)||!/^([0-9a-f]{40})$/.test(input.commit)||!/^([0-9a-f]{64})$/.test(input.hash)||!input.rollbackRef?.trim()||input.rollbackRef.length>500)throw Error('SKILL_PIN_REQUIRED');
 const row=(await c.query(`INSERT INTO company_skill_proposals(legal_entity_id,profile_id,source_url,source_commit,source_hash,proposed_by,rollback_ref)
  VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[company,input.profileId,url.href,input.commit,input.hash,context.actor,input.rollbackRef])).rows[0];
 await recordSkillEvent(c,company,context.actor,'COMPANY_SKILL_PROPOSED',row);return row;
}
export async function reviewCompanySkill(c:PoolClient,context:OwnerContext,input:{id:string;hash:string;checks:Record<string,boolean>;evidence:string}){
 const company=await authorizedCompany(c,context);
 if(!uuidPattern.test(input.id)||!/^[0-9a-f]{64}$/.test(input.hash))throw Error('SKILL_PIN_REQUIRED');
 if(!input.evidence?.trim()||input.evidence.length>2000||SKILL_REVIEW_CHECKS.some(key=>input.checks?.[key]!==true)||Object.keys(input.checks).some(k=>!SKILL_REVIEW_CHECKS.includes(k as any)))throw Error('SKILL_SECURITY_REVIEW_REQUIRED');
 const r=await c.query(`UPDATE company_skill_proposals SET state='REVIEWED',review=$4::jsonb,reviewed_by=$3,reviewed_hash=source_hash,updated_at=now()
  WHERE id=$1 AND legal_entity_id=$2 AND proposed_by<>$3 AND source_hash=$5 AND state='QUARANTINED' RETURNING *`,
  [input.id,company,context.actor,JSON.stringify({checks:input.checks,evidence:input.evidence}),input.hash]);
 if(r.rowCount!==1)throw Error('SKILL_REVIEW_DENIED');await recordSkillEvent(c,company,context.actor,'COMPANY_SKILL_REVIEWED',r.rows[0]);return r.rows[0];
}
export async function adoptCompanySkill(c:PoolClient,context:OwnerContext,input:{id:string;hash:string;approved:boolean}){
 const company=await authorizedCompany(c,context);if(!uuidPattern.test(input.id)||!/^[0-9a-f]{64}$/.test(input.hash))throw Error('SKILL_PIN_REQUIRED');if(input.approved!==true)throw Error('SKILL_EXPLICIT_ADOPTION_REQUIRED');
 const r=await c.query(`UPDATE company_skill_proposals SET state='ADOPTED',adopted_by=$3,updated_at=now()
 WHERE id=$1 AND legal_entity_id=$2 AND state='REVIEWED' AND proposed_by<>$3 AND reviewed_hash=source_hash AND source_hash=$4 RETURNING *`,[input.id,company,context.actor,input.hash]);
 if(r.rowCount!==1)throw Error('SKILL_ADOPTION_DENIED');await recordSkillEvent(c,company,context.actor,'COMPANY_SKILL_ADOPTED',r.rows[0]);return {...r.rows[0],execution:'NOT_INSTALLED; adoption never runs external code or changes capabilities'};
}
/** A changed source always needs a new quarantine/review/adoption cycle. */
export async function replaceCompanySkillSource(c:PoolClient,context:OwnerContext,input:{id:string;commit:string;hash:string}){
 const company=await authorizedCompany(c,context);if(!uuidPattern.test(input.id)||!/^[0-9a-f]{40}$/.test(input.commit)||!/^[0-9a-f]{64}$/.test(input.hash))throw Error('SKILL_PIN_REQUIRED');
 const previous=(await c.query('SELECT * FROM company_skill_proposals WHERE id=$1 AND legal_entity_id=$2 FOR UPDATE',[input.id,company])).rows[0];
 const r=await c.query(`UPDATE company_skill_proposals SET source_commit=$3,source_hash=$4,state='QUARANTINED',proposed_by=$5,review=NULL,reviewed_by=NULL,reviewed_hash=NULL,adopted_by=NULL,updated_at=now()
 WHERE id=$1 AND legal_entity_id=$2 RETURNING *`,[input.id,company,input.commit,input.hash,context.actor]);
 if(r.rowCount!==1)throw Error('SKILL_NOT_FOUND');await recordSkillEvent(c,company,context.actor,'COMPANY_SKILL_PIN_REPLACED',r.rows[0],previous);return r.rows[0];
}
