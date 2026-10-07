import type {
  ProductionActionDispatcher,
  RegisteredChatGPTTool
} from "./types";

export function createActionTools(dispatcher?:ProductionActionDispatcher):RegisteredChatGPTTool[]{
  const manifestAvailable=!!dispatcher;
  const executeAvailable=!!dispatcher;

  return [
    {
      definition:{
        name:"sam_capability_manifest",
        description:"List production capabilities, authority classes, specialist ownership, side-effect status and availability.",
        risk:"READ",
        availability:manifestAvailable?"READ_ONLY":"UNAVAILABLE",
        inputSchema:{type:"object",properties:{},additionalProperties:false}
      },
      handler:async()=>{
        if(!dispatcher) return {ok:false,unavailable:true,error:"Production capability dispatcher is not registered"};
        return {ok:true,data:await dispatcher.manifest()};
      }
    },
    {
      definition:{
        name:"sam_execute",
        description:"Execute one registered production capability through SAM authority and execution controls.",
        risk:"YELLOW",
        availability:executeAvailable?"AVAILABLE":"UNAVAILABLE",
        inputSchema:{
          type:"object",
          properties:{
            capability_id:{type:"string"},
            legal_entity_id:{type:"string"},
            objective:{type:"string"},
            params:{type:"object"}
          },
          required:["capability_id","legal_entity_id","params"],
          additionalProperties:false
        }
      },
      handler:async(args,context)=>{
        if(!dispatcher) return {ok:false,unavailable:true,error:"Production capability dispatcher is not registered"};
        const capabilityId=String(args.capability_id??"");
        const params=(args.params??{}) as Record<string,unknown>;
        const legalEntityId=String(args.legal_entity_id??"");
        const objective=args.objective?String(args.objective):undefined;
        const manifest=await dispatcher.manifest();
        const item=manifest.find((m)=>m.capabilityId===capabilityId);
        if(!item) return {ok:false,error:`Unknown production capability: ${capabilityId}`};
        if(item.availability!=="AVAILABLE"){
          return {ok:false,unavailable:true,error:`Capability ${capabilityId} is ${item.availability}`};
        }
        return {ok:true,data:await dispatcher.execute({
          capabilityId,
          params,
          actor:context.actor,
          legalEntityId,
          objective
        })};
      }
    },
    {
      definition:{
        name:"sam_reconcile_side_effects",
        description:"Run production side-effect reconciliation when a production reconciler is registered.",
        risk:"GREEN",
        availability:dispatcher?.reconcile?"AVAILABLE":"UNAVAILABLE",
        inputSchema:{
          type:"object",
          properties:{
            operation_key:{type:"string"},
            limit:{type:"integer",minimum:1,maximum:200}
          },
          additionalProperties:false
        }
      },
      handler:async(args,context)=>{
        if(!dispatcher?.reconcile){
          return {ok:false,unavailable:true,error:"Production reconciler is not registered"};
        }
        return {
          ok:true,
          data:await dispatcher.reconcile({
            operationKey:args.operation_key?String(args.operation_key):undefined,
            limit:args.limit?Number(args.limit):undefined,
            actor:context.actor
          })
        };
      }
    }
  ];
}
