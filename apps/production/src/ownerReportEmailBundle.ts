import type {ProductionBundle} from './types';
import {uuidPattern} from '../../../packages/shared/src/ownerScope';
import {withGmailFromEnv} from './gmailBundle';
import {GmailSendAdapter} from '../../tools/src/gmailSendAdapter';

/** Dedicated server route; never registers gmail_send as an available business capability. */
export function withOwnerReportEmailFromEnv(bundle:ProductionBundle,env:NodeJS.ProcessEnv=process.env):ProductionBundle{
 if(env.SAM_OWNER_REPORT_EMAIL_ENABLED!=='true')return bundle;
 const company=env.SAM_DEFAULT_LEGAL_ENTITY_ID?.trim()||env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID?.trim();
 const activatedAt=env.SAM_OWNER_REPORT_EMAIL_ACTIVATED_AT?.trim();
 const activationAuditId=env.SAM_OWNER_REPORT_EMAIL_ACTIVATION_AUDIT_ID?.trim();
 const classification=env.SAM_OWNER_REPORT_EMAIL_DATA_CLASSIFICATION?.trim();
 const backfillReportId=env.SAM_OWNER_REPORT_EMAIL_BACKFILL_REPORT_ID?.trim()||undefined;
 if(!company||!uuidPattern.test(company)||!activationAuditId||!uuidPattern.test(activationAuditId)||
  !activatedAt||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(activatedAt)||
  !Number.isFinite(Date.parse(activatedAt))||new Date(activatedAt).toISOString()!==activatedAt||
  !['PUBLIC','INTERNAL','CONFIDENTIAL'].includes(classification??'')||classification!==(bundle.dataClassification??'INTERNAL')||
  (backfillReportId&&!uuidPattern.test(backfillReportId))||
  (env.SAM_DEFAULT_LEGAL_ENTITY_ID&&env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID&&env.SAM_DEFAULT_LEGAL_ENTITY_ID.trim()!==env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID.trim()))throw Error('OWNER_REPORT_EMAIL_SERVER_BINDING_INVALID');
 const transport=withGmailFromEnv({capabilities:[],toolDefinitions:[],toolAdapters:[]},env).toolAdapters[0];
 if(!(transport instanceof GmailSendAdapter))throw Error('OWNER_REPORT_EMAIL_SEND_TRANSPORT_REQUIRED');
 return {...bundle,dataClassification:classification as 'PUBLIC'|'INTERNAL'|'CONFIDENTIAL',
  ownerReportEmail:{legalEntityId:company,recipient:'ceo@suroohholdings.com',activatedAt,activationAuditId,
   dataClassification:classification as 'PUBLIC'|'INTERNAL'|'CONFIDENTIAL',...(backfillReportId?{backfillReportId}:{})},ownerReportEmailAdapter:transport};
}
