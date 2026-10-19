import {createHash,createPrivateKey,createPublicKey,randomBytes,sign,scryptSync,timingSafeEqual,verify} from "node:crypto";
import type {IncomingMessage,ServerResponse} from "node:http";
import type {Pool} from "pg";

const ACCESS_SECONDS=900;
const REFRESH_SECONDS=30*24*60*60;
const AUTH_REQUEST_SECONDS=600;
const CODE_SECONDS=300;
const ALLOWED_SCOPES=new Set(["sam:access","offline_access"]);
const b64=(n=32)=>randomBytes(n).toString("base64url");
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);};

export interface InternalOAuthConfig {
  resource:string;
  ownerEmail:string;
  ownerPasswordHash:string;
  privateKeyPem:string;
  publicBaseUrl:string;
}
export function internalOAuthConfig(env:NodeJS.ProcessEnv):InternalOAuthConfig|undefined{
  if(env.SAM_MCP_INTERNAL_OAUTH_ENABLED!=="1")return undefined;
  const resource=env.SAM_MCP_PUBLIC_RESOURCE_URL?.trim();
  const ownerEmail=env.SAM_MCP_OAUTH_OWNER_EMAIL?.trim().toLowerCase();
  const suppliedPasswordHash=env.SAM_MCP_OAUTH_OWNER_PASSWORD_HASH?.trim();
  const bearerPassword=env.SAM_MCP_BEARER_TOKEN?.trim()??"";
  const ownerPasswordHash=suppliedPasswordHash||(bearerPassword?makePasswordHash(bearerPassword):"");
  const privateKeyPem=env.SAM_MCP_OAUTH_SIGNING_PRIVATE_KEY?.replace(/\\n/g,"\n").trim();
  if(!resource||!ownerEmail||!ownerPasswordHash||!privateKeyPem)throw new Error("MCP_INTERNAL_OAUTH_CONFIG_REQUIRED");
  if(!/^scrypt\$32768\$8\$1\$[A-Za-z0-9_-]{16,64}\$[A-Za-z0-9_-]{80,100}$/.test(ownerPasswordHash))throw new Error("MCP_INTERNAL_OAUTH_PASSWORD_HASH_INVALID");
  const u=new URL(resource);
  if(u.protocol!=="https:"||u.pathname!=="/mcp"||u.username||u.password||u.search||u.hash||ownerEmail.length>254||!ownerEmail.includes("@")){
    throw new Error("MCP_INTERNAL_OAUTH_CONFIG_INVALID");
  }
  const key=createPrivateKey(privateKeyPem);
  if(key.asymmetricKeyType!=="rsa"||(key.asymmetricKeyDetails?.modulusLength??0)<2048)throw new Error("MCP_INTERNAL_OAUTH_SIGNING_KEY_INVALID");
  return {resource,ownerEmail,ownerPasswordHash,privateKeyPem,publicBaseUrl:u.origin};
}

export function makePasswordHash(password:string,salt=b64(16)){
  if(password.length<16||password.length>1024)throw new Error("PASSWORD_MUST_BE_16_TO_1024_CHARACTERS");
  const hash=scryptSync(password,salt,64,{N:32768,r:8,p:1,maxmem:96*1024*1024}).toString("base64url");
  return `scrypt$32768$8$1$${salt}$${hash}`;
}
function verifyPassword(password:string,encoded:string){
  try{
    const [kind,n,r,p,salt,want,...extra]=encoded.split("$");
    if(kind!=="scrypt"||n!=="32768"||r!=="8"||p!=="1"||extra.length||!salt||!want||password.length>1024)return false;
    const actual=scryptSync(password,salt,64,{N:32768,r:8,p:1,maxmem:96*1024*1024});
    const expected=Buffer.from(want,"base64url");
    return actual.length===expected.length&&timingSafeEqual(actual,expected);
  }catch{return false;}
}

interface Client {client_id:string;redirect_uris:string[]}
interface AuthRequest {request_id:string;csrf:string;client_id:string;redirect_uri:string;state:string;challenge:string;scope:string;resource:string;expires_at:Date}
export interface OAuthStore {
  getClient(id:string):Promise<Client|undefined>;
  addClient(id:string,redirects:string[]):Promise<void>;
  saveAuthRequest(v:AuthRequest):Promise<void>;
  consumeAuthRequest(idHash:string,csrfHash:string):Promise<AuthRequest|undefined>;
  saveCode(v:{code_hash:string;client_id:string;redirect_uri:string;challenge:string;scope:string;resource:string;expires_at:Date}):Promise<void>;
  consumeCode(hash:string,clientId:string,redirectUri:string,challenge:string):Promise<{client_id:string;redirect_uri:string;challenge:string;scope:string;resource:string}|undefined>;
  saveRefresh(v:{token_hash:string;client_id:string;scope:string;resource:string;expires_at:Date}):Promise<void>;
  rotateRefresh(oldHash:string,newToken:{token_hash:string;client_id:string;resource:string;requestedScope?:string;expires_at:Date}):Promise<string|undefined>;
}

export function postgresOAuthStore(pool:Pool):OAuthStore{
  return {
    async getClient(id){const r=await pool.query("SELECT client_id,redirect_uris FROM mcp_oauth_clients WHERE client_id=$1",[id]);return r.rowCount?{client_id:r.rows[0].client_id,redirect_uris:r.rows[0].redirect_uris}:undefined;},
    async addClient(id,redirects){await pool.query("INSERT INTO mcp_oauth_clients(client_id,redirect_uris) VALUES($1,$2)",[id,redirects]);},
    async saveAuthRequest(v){await pool.query("DELETE FROM mcp_oauth_requests WHERE expires_at<=now()");await pool.query("INSERT INTO mcp_oauth_requests(request_hash,csrf_hash,client_id,redirect_uri,state,code_challenge,scope,resource,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",[sha(v.request_id),sha(v.csrf),v.client_id,v.redirect_uri,v.state,v.challenge,v.scope,v.resource,v.expires_at]);},
    async consumeAuthRequest(idHash,csrfHash){const r=await pool.query("DELETE FROM mcp_oauth_requests WHERE request_hash=$1 AND csrf_hash=$2 AND expires_at>now() RETURNING client_id,redirect_uri,state,code_challenge,scope,resource,expires_at",[idHash,csrfHash]);if(!r.rowCount)return undefined;const x=r.rows[0];return {request_id:"",csrf:"",client_id:x.client_id,redirect_uri:x.redirect_uri,state:x.state,challenge:x.code_challenge,scope:x.scope,resource:x.resource,expires_at:x.expires_at};},
    async saveCode(v){await pool.query("DELETE FROM mcp_oauth_codes WHERE expires_at<=now()");await pool.query("INSERT INTO mcp_oauth_codes(code_hash,client_id,redirect_uri,code_challenge,scope,resource,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7)",[v.code_hash,v.client_id,v.redirect_uri,v.challenge,v.scope,v.resource,v.expires_at]);},
    async consumeCode(hash,clientId,redirectUri,challenge){const r=await pool.query("DELETE FROM mcp_oauth_codes WHERE code_hash=$1 AND client_id=$2 AND redirect_uri=$3 AND code_challenge=$4 AND expires_at>now() RETURNING client_id,redirect_uri,code_challenge,scope,resource",[hash,clientId,redirectUri,challenge]);if(!r.rowCount)return undefined;const x=r.rows[0];return {client_id:x.client_id,redirect_uri:x.redirect_uri,challenge:x.code_challenge,scope:x.scope,resource:x.resource};},
    async saveRefresh(v){await pool.query("DELETE FROM mcp_oauth_refresh_tokens WHERE expires_at<=now()");await pool.query("INSERT INTO mcp_oauth_refresh_tokens(token_hash,client_id,scope,resource,expires_at) VALUES($1,$2,$3,$4,$5)",[v.token_hash,v.client_id,v.scope,v.resource,v.expires_at]);},
    async rotateRefresh(oldHash,v){const c=await pool.connect();try{await c.query("BEGIN");const old=await c.query("DELETE FROM mcp_oauth_refresh_tokens WHERE token_hash=$1 AND client_id=$2 AND resource=$3 AND ($4::text IS NULL OR scope=$4) AND expires_at>now() RETURNING scope",[oldHash,v.client_id,v.resource,v.requestedScope??null]);if(!old.rowCount){await c.query("ROLLBACK");return undefined;}const scope=old.rows[0].scope;await c.query("INSERT INTO mcp_oauth_refresh_tokens(token_hash,client_id,scope,resource,expires_at) VALUES($1,$2,$3,$4,$5)",[v.token_hash,v.client_id,scope,v.resource,v.expires_at]);await c.query("COMMIT");return scope;}catch(e){await c.query("ROLLBACK");throw e;}finally{c.release();}}
  };
}

function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("content-type","application/json; charset=utf-8");res.setHeader("cache-control","no-store");res.setHeader("pragma","no-cache");res.end(JSON.stringify(body));}
function textBody(req:IncomingMessage,max=8192):Promise<string>{return new Promise((resolve,reject)=>{let body="";req.on("data",chunk=>{body+=chunk;if(body.length>max){reject(new Error("BODY_TOO_LARGE"));req.destroy();}});req.on("end",()=>resolve(body));req.on("error",reject);});}
function redirectAllowed(value:string){try{const u=new URL(value);return u.protocol==="https:"&&u.hostname==="chatgpt.com"&&u.username===""&&u.password===""&&u.search===""&&u.hash===""&&(
  u.pathname==="/connector_platform_oauth_redirect"||/^\/connector\/oauth\/[A-Za-z0-9_-]{8,160}$/.test(u.pathname));}catch{return false;}}
function escapeHtml(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
function addQuery(uri:string,key:string,value:string){const u=new URL(uri);u.searchParams.set(key,value);return u.toString();}
function parseScopes(value:string){const scopes=[...new Set(value.split(/\s+/).filter(Boolean))];return scopes.length>0&&scopes.every(x=>ALLOWED_SCOPES.has(x))?scopes.join(" "):"";}

export class InternalOAuthServer {
  private readonly privateKey;
  private readonly publicKey;
  private readonly kid:string;
  private readonly issuer:string;
  private failures=new Map<string,{count:number;until:number}>();
  constructor(private readonly config:InternalOAuthConfig,private readonly store:OAuthStore){
    this.privateKey=createPrivateKey(config.privateKeyPem);this.publicKey=createPublicKey(this.privateKey);
    const jwk=this.publicKey.export({format:"jwk"}) as JsonWebKey;
    this.kid=createHash("sha256").update(String(jwk.n)+String(jwk.e)).digest("hex").slice(0,24);
    this.issuer=config.publicBaseUrl;
  }
  protectedResource(){return {resource:this.config.resource,authorization_servers:[this.issuer],scopes_supported:["sam:access","offline_access"],bearer_methods_supported:["header"]};}
  resourceUrl(){return this.config.resource;}
  authorizationMetadata(){return {issuer:this.issuer,authorization_endpoint:this.issuer+"/oauth/authorize",token_endpoint:this.issuer+"/oauth/token",registration_endpoint:this.issuer+"/oauth/register",jwks_uri:this.issuer+"/oauth/jwks.json",response_types_supported:["code"],grant_types_supported:["authorization_code","refresh_token"],code_challenge_methods_supported:["S256"],token_endpoint_auth_methods_supported:["none"],scopes_supported:["sam:access","offline_access"],authorization_response_iss_parameter_supported:true};}
  jwks(){const k=this.publicKey.export({format:"jwk"}) as JsonWebKey;return {keys:[{kty:k.kty,n:k.n,e:k.e,alg:"RS256",use:"sig",kid:this.kid}]};}
  async handle(req:IncomingMessage,res:ServerResponse,path:string){
    if(req.method==="OPTIONS"&&["/oauth/token","/oauth/register"].includes(path)){
      res.statusCode=204;res.setHeader("access-control-allow-origin","*");res.setHeader("access-control-allow-methods","POST, OPTIONS");res.setHeader("access-control-allow-headers","content-type");res.end();return true;
    }
    if(req.method==="GET"&&path==="/.well-known/oauth-protected-resource"){json(res,200,this.protectedResource());return true;}
    if(req.method==="GET"&&path==="/.well-known/oauth-protected-resource/mcp"){json(res,200,this.protectedResource());return true;}
    if(req.method==="GET"&&path==="/.well-known/oauth-authorization-server"){json(res,200,this.authorizationMetadata());return true;}
    if(req.method==="GET"&&path==="/oauth/jwks.json"){json(res,200,this.jwks());return true;}
    if(req.method==="POST"&&path==="/oauth/register"){await this.register(req,res);return true;}
    if(path==="/oauth/authorize"&&req.method==="GET"){await this.authorize(req,res);return true;}
    if(path==="/oauth/authorize/login"&&req.method==="POST"){await this.login(req,res);return true;}
    if(path==="/oauth/token"&&req.method==="POST"){await this.token(req,res);return true;}
    return false;
  }
  private async register(req:IncomingMessage,res:ServerResponse){
    try{
      if(!/^application\/json(?:;|$)/i.test(req.headers["content-type"]??""))return json(res,415,{error:"invalid_client_metadata"});
      const b=JSON.parse(await textBody(req,16384));const redirects=b.redirect_uris;
      if(!Array.isArray(redirects)||redirects.length<1||redirects.length>5||redirects.some((x:unknown)=>typeof x!=="string"||!redirectAllowed(x)))return json(res,400,{error:"invalid_redirect_uri"});
      const id=b64(32);await this.store.addClient(id,[...new Set(redirects)]);
      json(res,201,{client_id:id,client_id_issued_at:Math.floor(Date.now()/1000),redirect_uris:[...new Set(redirects)],grant_types:["authorization_code","refresh_token"],response_types:["code"],token_endpoint_auth_method:"none"});
    }catch{return json(res,400,{error:"invalid_client_metadata"});}
  }
  private async authorize(req:IncomingMessage,res:ServerResponse){
    const u=new URL(req.url??"/oauth/authorize","https://invalid");
    const clientId=u.searchParams.get("client_id")??"",redirect=u.searchParams.get("redirect_uri")??"",state=u.searchParams.get("state")??"",challenge=u.searchParams.get("code_challenge")??"",scope=parseScopes(u.searchParams.get("scope")??"sam:read offline_access"),resource=u.searchParams.get("resource")??"";
    const client=await this.store.getClient(clientId);
    if(!client||!client.redirect_uris.includes(redirect)||!redirectAllowed(redirect)||u.searchParams.get("response_type")!=="code"||u.searchParams.get("code_challenge_method")!=="S256"||!/^[A-Za-z0-9_-]{43,128}$/.test(challenge)||state.length<16||state.length>1024||!scope||!scope.split(" ").includes("sam:access")||resource!==this.config.resource){json(res,400,{error:"invalid_authorization_request"});return;}
    const requestId=b64(),csrf=b64();await this.store.saveAuthRequest({request_id:requestId,csrf,client_id:clientId,redirect_uri:redirect,state,challenge,scope,resource,expires_at:new Date(Date.now()+AUTH_REQUEST_SECONDS*1000)});
    res.statusCode=200;res.setHeader("content-type","text/html; charset=utf-8");res.setHeader("cache-control","no-store");res.setHeader("content-security-policy","default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sign in to SAM</title><style>body{font:16px system-ui;max-width:28rem;margin:8vh auto;padding:1rem;color:#17202a}input,button{font:inherit;width:100%;padding:.7rem;margin:.3rem 0;box-sizing:border-box}button{background:#102a43;color:white;border:0;border-radius:.4rem}</style><h1>Sign in to SAM</h1><p>Allow ChatGPT to use the SAM tools available to ${escapeHtml(this.config.ownerEmail)}: ${escapeHtml(scope)}. Some tools can make changes.</p><form method="post" action="/oauth/authorize/login" target="_top"><input type="hidden" name="request_id" value="${requestId}"><input type="hidden" name="csrf" value="${csrf}"><label>Email<input name="email" type="email" autocomplete="username" required maxlength="254"></label><label>Password<input name="password" type="password" autocomplete="current-password" required maxlength="1024"></label><button type="submit">Continue</button></form></html>`);
  }
  private async login(req:IncomingMessage,res:ServerResponse){
    try{
      if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(req.headers["content-type"]??""))return json(res,415,{error:"invalid_request"});
      const b=new URLSearchParams(await textBody(req,4096));const rid=b.get("request_id")??"",csrf=b.get("csrf")??"",email=(b.get("email")??"").trim().toLowerCase(),password=b.get("password")??"";
      const key=req.socket.remoteAddress??"unknown",now=Date.now(),rec=this.failures.get(key);if(rec&&rec.until>now&&rec.count>=8){json(res,429,{error:"temporarily_locked"});return;}
      const request=await this.store.consumeAuthRequest(sha(rid),sha(csrf));
      const passwordValid=verifyPassword(password,this.config.ownerPasswordHash);
      if(!request||!equal(email,this.config.ownerEmail)||!passwordValid){
        const old=this.failures.get(key);this.failures.set(key,{count:old&&old.until>now?old.count+1:1,until:old&&old.until>now?old.until:now+15*60*1000});
        res.statusCode=401;res.setHeader("content-type","text/html; charset=utf-8");res.setHeader("cache-control","no-store");res.end("<!doctype html><title>Sign in failed</title><p>Sign-in failed. Reopen the ChatGPT connection and try again.</p>");return;
      }
      this.failures.delete(key);const code=b64();await this.store.saveCode({code_hash:sha(code),client_id:request.client_id,redirect_uri:request.redirect_uri,challenge:request.challenge,scope:request.scope,resource:request.resource,expires_at:new Date(Date.now()+CODE_SECONDS*1000)});
      const callbackUrl=escapeHtml(addQuery(addQuery(addQuery(request.redirect_uri,"code",code),"state",request.state),"iss",this.issuer));
      res.statusCode=200;res.setHeader("content-type","text/html; charset=utf-8");res.setHeader("cache-control","no-store");res.setHeader("pragma","no-cache");res.setHeader("referrer-policy","no-referrer");res.setHeader("x-content-type-options","nosniff");res.setHeader("content-security-policy","default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
      res.end(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${callbackUrl}"><title>إكمال ربط SAM</title><body style="font:16px system-ui;max-width:440px;margin:48px auto;padding:24px;color:#172b4d"><h1 style="font-size:22px">تم قبول بيانات الدخول</h1><p>جارٍ الرجوع إلى ChatGPT لإكمال الربط.</p><p>إذا لم تنتقل الصفحة تلقائياً، اضغط الزر:</p><p><a href="${callbackUrl}" target="_top" rel="noopener" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px">العودة إلى ChatGPT</a></p></body></html>`);
    }catch{json(res,400,{error:"invalid_authorization_request"});}
  }
  private jwt(sub:string,clientId:string,scope:string){
    const now=Math.floor(Date.now()/1000),header=Buffer.from(JSON.stringify({alg:"RS256",typ:"at+jwt",kid:this.kid})).toString("base64url"),payload=Buffer.from(JSON.stringify({iss:this.issuer,sub,aud:this.config.resource,client_id:clientId,scope,iat:now,exp:now+ACCESS_SECONDS,jti:b64(16)})).toString("base64url"),input=header+"."+payload;
    return input+"."+sign("RSA-SHA256",Buffer.from(input),this.privateKey).toString("base64url");
  }
  private async token(req:IncomingMessage,res:ServerResponse){
    res.setHeader("access-control-allow-origin","*");res.setHeader("access-control-allow-headers","content-type");
    try{
      if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(req.headers["content-type"]??""))return json(res,415,{error:"invalid_request"});
      const b=new URLSearchParams(await textBody(req,8192)),grant=b.get("grant_type")??"",clientId=b.get("client_id")??"",resource=b.get("resource")??"";
      if(!clientId||!(await this.store.getClient(clientId))||resource!==this.config.resource)return json(res,400,{error:"invalid_grant"});
      let scope="";
      if(grant==="authorization_code"){
        const code=b.get("code")??"",redirect=b.get("redirect_uri")??"",verifier=b.get("code_verifier")??"";
        if(!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))return json(res,400,{error:"invalid_grant"});
        const computed=createHash("sha256").update(verifier).digest("base64url");
        const record=await this.store.consumeCode(sha(code),clientId,redirect,computed);
        if(!record||record.resource!==resource)return json(res,400,{error:"invalid_grant"});
        scope=record.scope;
      }else if(grant==="refresh_token"){
        const raw=b.get("refresh_token")??"",hash=sha(raw),scopeParam=b.get("scope");
        if(!raw||(scopeParam!==null&&!parseScopes(scopeParam)))return json(res,400,{error:"invalid_grant"});
        const newRefresh=b64(48);const scope=await this.store.rotateRefresh(hash,{token_hash:sha(newRefresh),client_id:clientId,resource,...(scopeParam!==null?{requestedScope:scopeParam}:{}),expires_at:new Date(Date.now()+REFRESH_SECONDS*1000)});
        if(!scope)return json(res,400,{error:"invalid_grant"});
        return json(res,200,{access_token:this.jwt(this.config.ownerEmail,clientId,scope),token_type:"Bearer",expires_in:ACCESS_SECONDS,refresh_token:newRefresh,scope});
      }else return json(res,400,{error:"unsupported_grant_type"});
      const refresh=scope.split(" ").includes("offline_access")?b64(48):undefined;
      if(refresh)await this.store.saveRefresh({token_hash:sha(refresh),client_id:clientId,scope,resource,expires_at:new Date(Date.now()+REFRESH_SECONDS*1000)});
      json(res,200,{access_token:this.jwt(this.config.ownerEmail,clientId,scope),token_type:"Bearer",expires_in:ACCESS_SECONDS,...(refresh?{refresh_token:refresh}:{}),scope});
    }catch{json(res,400,{error:"invalid_grant"});}
  }
  authenticate(token:string){
    try{
      const [h,p,s,...rest]=token.split(".");if(!h||!p||!s||rest.length||token.length>8192)return false;
      const header=JSON.parse(Buffer.from(h,"base64url").toString("utf8")),claims=JSON.parse(Buffer.from(p,"base64url").toString("utf8"));
      if(header.alg!=="RS256"||header.kid!==this.kid||claims.iss!==this.issuer||claims.sub!==this.config.ownerEmail||claims.aud!==this.config.resource||typeof claims.client_id!=="string"||typeof claims.exp!=="number"||claims.exp<=Date.now()/1000||typeof claims.iat!=="number"||claims.iat>Date.now()/1000+60||claims.exp-claims.iat>ACCESS_SECONDS)return false;
      const scopes=parseScopes(String(claims.scope??""));if(!scopes.split(" ").includes("sam:access"))return false;
      return verify("RSA-SHA256",Buffer.from(h+"."+p),this.publicKey,Buffer.from(s,"base64url"));
    }catch{return false;}
  }
}
