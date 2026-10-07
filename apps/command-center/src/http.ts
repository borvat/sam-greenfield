import {timingSafeEqual} from "node:crypto";
import {createServer,type IncomingMessage,type Server,type ServerResponse} from "node:http";
import {commandCenterHtml} from "./ui";
import {commandCenterOverview,commandCenterGoals,commandCenterGoalTimeline,commandCenterLatestFinanceBrief,createOwnerGoal} from "./store";

function csv(value:string|undefined):string[]{return (value??"").split(",").map(v=>v.trim()).filter(Boolean)}
function bearer(req:IncomingMessage):string{const h=req.headers.authorization??"";return h.startsWith("Bearer ")?h.slice(7):""}
function safeEqual(a:string,b:string):boolean{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
function host(req:IncomingMessage):string{try{return new URL("http://"+(req.headers.host??"")).hostname.toLowerCase()}catch{return ""}}
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("content-type","application/json");res.end(JSON.stringify(body))}
async function readJson(req:IncomingMessage):Promise<any>{const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));if(chunks.reduce((n,b)=>n+b.length,0)>64*1024)throw new Error("request too large");const raw=Buffer.concat(chunks).toString("utf8");return raw?JSON.parse(raw):{}}

export interface CommandCenterHttpOptions{
  legalEntityId:string;
  port:number;
  host?:string;
  bearerToken?:string;
  allowedHosts?:string;
  allowedOrigins?:string;
}

export async function startCommandCenterHttpServer(options:CommandCenterHttpOptions):Promise<{server:Server;close():Promise<void>}>{
  const hosts=new Set(csv(options.allowedHosts).map(x=>x.toLowerCase()));
  const origins=new Set(csv(options.allowedOrigins));
  const token=options.bearerToken??"";

  const server=createServer(async(req,res)=>{
    try{
      if(req.method==="GET"&&req.url==="/livez"){json(res,200,{status:"alive"});return}
      if(req.method==="GET"&&req.url==="/"){res.statusCode=200;res.setHeader("content-type","text/html; charset=utf-8");res.setHeader("cache-control","no-store");res.end(commandCenterHtml);return}

      if(hosts.size>0&&!hosts.has(host(req))){json(res,403,{error:"host_not_allowed"});return}
      const origin=req.headers.origin;
      if(origin&&origins.size>0&&!origins.has(origin)){json(res,403,{error:"origin_not_allowed"});return}
      if(token&&!safeEqual(bearer(req),token)){json(res,401,{error:"unauthorized"});return}

      if(req.method==="OPTIONS"){
        res.statusCode=204;
        if(origin)res.setHeader("access-control-allow-origin",origin);
        res.setHeader("access-control-allow-headers","authorization,content-type");
        res.setHeader("access-control-allow-methods","GET,POST,OPTIONS");
        res.end();return;
      }
      if(origin&&origins.has(origin))res.setHeader("access-control-allow-origin",origin);
      res.setHeader("cache-control","no-store");

      if(req.method==="GET"&&req.url==="/api/overview"){
        json(res,200,{ok:true,data:await commandCenterOverview(options.legalEntityId)});return;
      }
      if(req.method==="GET"&&req.url?.startsWith("/api/goals?")||req.method==="GET"&&req.url==="/api/goals"){
        const u=new URL(req.url??"/api/goals","http://local");
        json(res,200,{ok:true,data:await commandCenterGoals(options.legalEntityId,Number(u.searchParams.get("limit")??100))});return;
      }
      const timeline=req.url?.match(/^\/api\/goals\/([0-9a-fA-F-]+)\/timeline$/);
      if(req.method==="GET"&&timeline){
        const data=await commandCenterGoalTimeline(options.legalEntityId,timeline[1]);
        if(!data){json(res,404,{error:"goal_not_found"});return}
        json(res,200,{ok:true,data});return;
      }
      if(req.method==="GET"&&req.url==="/api/finance/latest"){
        json(res,200,{ok:true,data:await commandCenterLatestFinanceBrief(options.legalEntityId)});return;
      }
      if(req.method==="POST"&&req.url==="/api/goals"){
        const body=await readJson(req);
        const data=await createOwnerGoal(options.legalEntityId,{
          objective:body.objective,
          domain:body.domain,
          priority:body.priority,
          authorityCeiling:body.authority_ceiling
        });
        json(res,201,{ok:true,data});return;
      }

      json(res,404,{error:"not_found"});
    }catch(err){
      json(res,400,{error:err instanceof Error?err.message:"request_failed"});
    }
  });

  await new Promise<void>((resolve,reject)=>{
    server.once("error",reject);
    server.listen(options.port,options.host??"0.0.0.0",()=>{server.off("error",reject);resolve()});
  });
  return {server,async close(){await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()))}};
}
