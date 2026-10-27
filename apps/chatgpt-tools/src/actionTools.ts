import type {
  ProductionActionDispatcher,
  RegisteredChatGPTTool
} from "./types";
import {GOAL_ACCEPTANCE_SCHEMA,validateGoalAcceptance} from '../../kernel/src/goalAcceptance';
import {ANALYSIS_REQUEST_SCHEMA,validateAnalysisRequest} from '../../production/src/dataAnalysisContract';

export function createActionTools(dispatcher?:ProductionActionDispatcher):RegisteredChatGPTTool[]{
  const manifestAvailable=!!dispatcher;
  const executeAvailable=!!dispatcher;
  const bolCapabilities=dispatcher?dispatcher.manifest().filter((item)=>item.capabilityId.startsWith("bol_")):[];
  const directBolTools:RegisteredChatGPTTool[]=bolCapabilities.map((item)=>({
    definition:{
      name:item.capabilityId,
      description:item.description??`Execute ${item.capabilityId} through SAM's authority and verification controls.`,
      risk:item.authorityClass==="GREEN"?"GREEN":item.authorityClass,
      availability:item.availability,
      inputSchema:{
        ...(item.inputSchema??{type:"object",additionalProperties:true}),
        properties:{acceptance_contract:{type:"object",description:"Owner-supplied completion criteria; required for production direct execution."},...((item.inputSchema?.properties as Record<string,unknown>|undefined)??{}),legal_entity_id:{type:"string",description:"SAM legal entity ID; optional when SAM_DEFAULT_LEGAL_ENTITY_ID is configured."}}
      }
    },
    handler:async(args,context)=>{
      if(!dispatcher) return {ok:false,unavailable:true,error:"Production capability dispatcher is not registered"};
      const {legal_entity_id,acceptance_contract,...params}=args;
      const legalEntityId=String(legal_entity_id??process.env.SAM_DEFAULT_LEGAL_ENTITY_ID??process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID??process.env.SAM_FINANCE_LEGAL_ENTITY_ID??"").trim();
      if(!legalEntityId) return {ok:false,error:"Provide legal_entity_id or configure SAM_DEFAULT_LEGAL_ENTITY_ID in SAM."};
      return {ok:true,data:await dispatcher.execute({
        capabilityId:item.capabilityId,
        acceptanceContract:acceptance_contract,params,
        actor:context.actor,
        legalEntityId,
        objective:`Execute bol.com capability ${item.capabilityId}`
      })};
    }
  }));

  return [
    ...directBolTools,
    {
      definition:{name:'sam_continue_review',description:'Resume a waiting read-report review using existing verified execution evidence and only its remaining review budget. Never repeats source work or resets an exhausted budget. Requires the existing goal contract and owner authorization.',risk:'YELLOW',
        availability:dispatcher?.continueReview?'AVAILABLE':'UNAVAILABLE',inputSchema:{type:'object',properties:{goal_id:{type:'string',format:'uuid'},legal_entity_id:{type:'string',format:'uuid'}},required:['goal_id','legal_entity_id'],additionalProperties:false}},
      handler:async(args,context)=>{
        if(!context.systemOwner)return {ok:false,error:'System-owner context is required'};
        if(!dispatcher?.continueReview)return {ok:false,unavailable:true,error:'Review continuation is unavailable'};
        return {ok:true,data:await dispatcher.continueReview({goalId:String(args.goal_id),legalEntityId:String(args.legal_entity_id),actor:context.actor})};
      }
    },
    {
      definition:{
        name:"sam_submit_goal",
        description:"Submit a new business objective to SAM's autonomous production planner. SAM creates a NEW goal; the Render worker chooses and persists the plan, delegates its steps, executes them, and verifies the results. YELLOW/RED or unknown capabilities remain blocked by SAM authority controls. Requires a configured planning model; no provider write is authorized by this tool.",
        risk:"YELLOW",
        availability:dispatcher?.submitGoal?"AVAILABLE":"UNAVAILABLE",
        inputSchema:{
          type:"object",
          properties:{
            objective:{type:"string",minLength:1,maxLength:4000},
            acceptance_contract:GOAL_ACCEPTANCE_SCHEMA,
            analysis_request:ANALYSIS_REQUEST_SCHEMA,
            legal_entity_id:{type:"string",description:"SAM legal entity UUID; optional when SAM_DEFAULT_LEGAL_ENTITY_ID is configured."}
          },
          required:["objective"],
          additionalProperties:false
        }
      },
      handler:async(args,context)=>{
        if(!dispatcher?.submitGoal) return {ok:false,unavailable:true,error:"Production goal planner is not registered"};
        const legalEntityId=String(args.legal_entity_id??process.env.SAM_DEFAULT_LEGAL_ENTITY_ID??process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID??process.env.SAM_FINANCE_LEGAL_ENTITY_ID??"").trim();
        if(!legalEntityId) return {ok:false,error:"Provide legal_entity_id or configure SAM_DEFAULT_LEGAL_ENTITY_ID in SAM."};
        const objective=String(args.objective??"").trim();
        if(!objective) return {ok:false,error:"objective is required"};
        const acceptanceContract=args.acceptance_contract===undefined?undefined:validateGoalAcceptance(args.acceptance_contract);
        const analysisRequest=args.analysis_request===undefined?undefined:validateAnalysisRequest(args.analysis_request);
        const data=await dispatcher.submitGoal({objective,legalEntityId,actor:context.actor,
          ...(acceptanceContract===undefined?{}:{acceptanceContract}),...(analysisRequest===undefined?{}:{analysisRequest})}) as Record<string,unknown>;
        if(data?.status==="UNAVAILABLE"){
          return {ok:false,unavailable:true,error:String(data.message??"SAM planning is unavailable; no goal was created"),data};
        }
        return {ok:true,data};
      }
    },
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
            acceptance_contract:GOAL_ACCEPTANCE_SCHEMA,
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
          objective,acceptanceContract:args.acceptance_contract===undefined?undefined:validateGoalAcceptance(args.acceptance_contract)
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
