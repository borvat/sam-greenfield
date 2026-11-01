import {CredentialVault,VaultError} from "../../../packages/db/src/credentialVault";
import {PROVIDER_FIELDS,type CredentialProvider} from "../../../packages/credentials/src/resolver";

// Operator tool for the credential vault. Run ON THE SERVER, inside the runtime
// container (it needs the worker database login and the vault master keys):
//   docker compose exec sam npm run vault -- put --entity <uuid> --provider bol
// Secret values are never accepted as arguments (they would land in shell history and
// `ps`): they are typed at a hidden prompt, or piped as JSON with --json-stdin.
// Output never contains a secret value.

export type CliIo={
  out(line:string):void;
  err(line:string):void;
  isInteractive:boolean;
  readHidden(prompt:string):Promise<string>;
  readStdin():Promise<string>;
};

const USAGE=`usage:
  vault put    --entity <uuid> --provider <bol|gmail|eboekhouden> [--name default] [--json-stdin]
  vault check  --entity <uuid> --provider <p> [--name default]     decrypt and validate; prints field names only
  vault list   [--entity <uuid>]                                    metadata only
  vault revoke --entity <uuid> --provider <p> [--name default]
  vault rotate-keys                                                 re-encrypt ACTIVE secrets under the active master key`;

function parse(argv:string[]):{cmd:string;flags:Map<string,string|true>}{
  const [cmd="",...rest]=argv;const flags=new Map<string,string|true>();
  for(let i=0;i<rest.length;i++){
    const a=rest[i];
    if(!a.startsWith("--"))throw new Error(`unexpected argument: ${a}`);
    const key=a.slice(2),next=rest[i+1];
    if(key==="json-stdin"){flags.set(key,true);continue;}
    if(next===undefined||next.startsWith("--"))throw new Error(`--${key} needs a value`);
    flags.set(key,next);i++;
  }
  return {cmd,flags};
}

export async function runVaultCli(argv:string[],io:CliIo,vault:CredentialVault,actor:string):Promise<number>{
  try{
    const {cmd,flags}=parse(argv);
    const str=(k:string,d?:string)=>{
      const v=flags.get(k);
      if(typeof v==="string")return v;
      if(d!==undefined)return d;
      throw new Error(`--${k} is required`);
    };
    const provider=()=>{
      const p=str("provider");
      if(!(p in PROVIDER_FIELDS))throw new Error(`unknown provider "${p}" (known: ${Object.keys(PROVIDER_FIELDS).join(", ")})`);
      return p as CredentialProvider;
    };
    if(cmd==="list"){
      const rows=await vault.list(flags.has("entity")?str("entity"):undefined);
      if(!rows.length)io.out("(no credentials)");
      for(const r of rows)io.out([r.legalEntityId,r.provider,r.name,`v${r.secretVersion}`,`key${r.keyVersion}`,r.status,r.createdAt.toISOString(),r.createdBy].join("\t"));
      return 0;
    }
    if(cmd==="rotate-keys"){
      const r=await vault.rotateKeys(actor);
      io.out(`re-encrypted: ${r.rotated}`);
      for(const f of r.failed)io.err(`FAILED ${f.legalEntityId} ${f.provider}/${f.name}: ${f.code}`);
      return r.failed.length?3:0;
    }
    if(cmd==="put"){
      const p=provider(),spec=PROVIDER_FIELDS[p],allowed=new Set([...spec.required,...spec.optional]);
      let fields:Record<string,string>={};
      if(flags.has("json-stdin")){
        let parsed:unknown;
        try{parsed=JSON.parse(await io.readStdin());}catch{throw new Error("stdin is not valid JSON");}
        if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("stdin must be a JSON object");
        fields=parsed as Record<string,string>;
      }else{
        if(!io.isInteractive)throw new Error("refusing to read secrets from a non-interactive stdin; use --json-stdin");
        for(const f of spec.required)fields[f]=(await io.readHidden(`${f}: `)).trim();
        for(const f of spec.optional){const v=(await io.readHidden(`${f} (optional, Enter to skip): `)).trim();if(v)fields[f]=v;}
      }
      const unknown=Object.keys(fields).filter(k=>!allowed.has(k));
      if(unknown.length)throw new Error(`unknown field(s) for ${p}: ${unknown.join(", ")}`);
      const missing=spec.required.filter(k=>!fields[k]||typeof fields[k]!=="string");
      if(missing.length)throw new Error(`missing required field(s): ${missing.join(", ")}`);
      const r=await vault.put({legalEntityId:str("entity"),provider:p,name:str("name","default"),secret:fields,actor});
      io.out(`stored ${p}/${str("name","default")} for ${str("entity")} as version ${r.secretVersion}`);
      return 0;
    }
    if(cmd==="check"){
      const p=provider(),name=str("name","default");
      const s=await vault.get({legalEntityId:str("entity"),provider:p,name,actor});
      if(!s){io.err("NOT FOUND");return 2;}
      const missing=PROVIDER_FIELDS[p].required.filter(k=>!s[k]);
      io.out(`OK ${p}/${name} fields: ${Object.keys(s).sort().join(", ")}`);
      if(missing.length){io.err(`INCOMPLETE, missing: ${missing.join(", ")}`);return 3;}
      return 0;
    }
    if(cmd==="revoke"){
      const ok=await vault.revoke({legalEntityId:str("entity"),provider:provider(),name:str("name","default"),actor});
      io.out(ok?"revoked":"nothing to revoke");
      return ok?0:2;
    }
    io.err(USAGE);
    return 64;
  }catch(e){
    io.err(e instanceof VaultError?`vault error: ${e.code}`:`error: ${(e as Error).message}`);
    return 1;
  }
}
