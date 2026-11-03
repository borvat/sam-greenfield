import { generateKeyPairSync, sign } from 'node:crypto';
import { authenticateSamModelToken } from '../../packages/ai-infrastructure/src/samIdentity';
import type { ExactTariff } from '../../packages/ai-infrastructure/src/exactMoney';

export function syntheticSamIdentity() {
  const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const orgId='00000000-0000-4000-8000-000000000001',entityId='00000000-0000-4000-8000-000000000002';
  const now=Math.floor(Date.now()/1000);
  const config={resource:'https://synthetic.invalid/mcp',issuer:'https://synthetic-issuer.invalid/',claimNamespace:'https://sam.invalid',
    subject:'synthetic-service',clientId:'synthetic-client',orgId,entityId,runId:'synthetic-run',keys:new Map([['fixture',publicKey]]),deadline:Date.now()+600000,maxGoals:2};
  function token(patch:object={}) {
    const header=Buffer.from(JSON.stringify({alg:'RS256',typ:'at+jwt',kid:'fixture'})).toString('base64url');
    const payload=Buffer.from(JSON.stringify({aud:config.resource,iss:config.issuer,sub:config.subject,client_id:config.clientId,
      [config.claimNamespace+'/org_id']:orgId,[config.claimNamespace+'/legal_entity_id']:entityId,
      [config.claimNamespace+'/pilot_run_id']:config.runId,iat:now,exp:now+300,scope:'sam:synthetic:submit',...patch})).toString('base64url');
    return `${header}.${payload}.${sign('RSA-SHA256',Buffer.from(header+'.'+payload),privateKey).toString('base64url')}`;
  }
  return {config,token,identity:authenticateSamModelToken(token(),config)};
}
export const fixtureTariff=():ExactTariff=>({providerId:'deepseek',model:'requested-model',reportedModels:['requested-model','reported-version'],
  inputMicrousdPerMillion:'1000000',outputMicrousdPerMillion:'2000000',cachedMicrousdPerMillion:'100000',
  maxInputTokens:10000,maxOutputTokens:512,framingTokens:512,sourceSha256:'1'.repeat(64),reviewedUntil:new Date(Date.now()+60000).toISOString()});
