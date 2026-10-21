import { withTransaction } from "../../../packages/db/src/client";
import type { ProviderConfig } from "../../../packages/model-gateway/src/types";

export async function syncProductionModelRegistry(
  configs:ProviderConfig[]
):Promise<void>{
  if(configs.length===0) return;

  await withTransaction(async(client)=>{
    for(const provider of configs){
      if(process.env.NODE_ENV==='production'){
        const row=(await client.query('SELECT models,capabilities,privacy_class_allowed,cost_per_1k_input,cost_per_1k_output FROM model_providers WHERE provider_id=$1',[provider.providerId])).rows[0];
        if(!row||JSON.stringify(row.models)!==JSON.stringify(provider.models)||JSON.stringify(row.capabilities)!==JSON.stringify(provider.capabilities)||
          JSON.stringify(row.privacy_class_allowed)!==JSON.stringify(provider.privacyClasses)||row.cost_per_1k_input!==provider.costPer1kInput||row.cost_per_1k_output!==provider.costPer1kOutput)
          throw new Error('MODEL_REGISTRY_PROVISIONING_REQUIRED');
        continue;
      }
      await client.query(
        `INSERT INTO model_providers
          (provider_id,models,capabilities,cost_per_1k_input,cost_per_1k_output,privacy_class_allowed,health)
         VALUES($1,$2::jsonb,$3::jsonb,$4,$5,$6::jsonb,$7)
         ON CONFLICT(provider_id) DO UPDATE SET
           models=EXCLUDED.models,
           capabilities=EXCLUDED.capabilities,
           cost_per_1k_input=EXCLUDED.cost_per_1k_input,
           cost_per_1k_output=EXCLUDED.cost_per_1k_output,
           privacy_class_allowed=EXCLUDED.privacy_class_allowed,
           health=CASE
             WHEN model_providers.health='DOWN' THEN model_providers.health
             ELSE EXCLUDED.health
           END`,
        [
          provider.providerId,
          JSON.stringify(provider.models),
          JSON.stringify(provider.capabilities),
          provider.costPer1kInput,
          provider.costPer1kOutput,
          JSON.stringify(provider.privacyClasses),
          provider.health
        ]
      );
    }
  });
}
