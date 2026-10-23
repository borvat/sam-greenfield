/** Reviewed 2026-10-23. Exact allowlists, not an OpenAI-compatibility assumption.
 * See docs/fixes/bounded-live-entry.md for provider contracts and release limits. */
export function evaluationWireProfile(providerId:string,model:string,endpoint:string){
 let url:URL;try{url=new URL(endpoint);}catch{throw Error('EVALUATION_WIRE_PROFILE_REQUIRED');}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash)throw Error('EVALUATION_WIRE_PROFILE_REQUIRED');
 if(providerId==='deepseek'&&url.hostname==='api.deepseek.com'&&['/chat/completions','/v1/chat/completions'].includes(url.pathname)&&
  ['deepseek-flash','deepseek-v4-pro'].includes(model))return {field:'max_tokens' as const,tolerance:0};
 const qwenHost=['dashscope.aliyuncs.com','dashscope-intl.aliyuncs.com','dashscope-us.aliyuncs.com','cn-hongkong.dashscope.aliyuncs.com'].includes(url.hostname)||
  /^[a-z0-9-]+\.(ap-southeast-1|us-east-1|cn-beijing|cn-hongkong|eu-central-1|ap-northeast-1)\.maas\.aliyuncs\.com$/.test(url.hostname);
 // Only exact reviewed names whose JSON output and combined reasoning+answer cap
 // are both documented. New generations/snapshots require explicit review.
 if(providerId==='qwen'&&qwenHost&&url.pathname==='/compatible-mode/v1/chat/completions'&&
  ['qwen3.7-max','qwen3.8-max','qwen3.7-plus','qwen3.7-flash','qwen3.8-flash'].includes(model))return {field:'max_completion_tokens' as const,tolerance:10};
 throw Error('EVALUATION_WIRE_PROFILE_REQUIRED');
}
