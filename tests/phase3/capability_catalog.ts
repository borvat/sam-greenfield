import assert from "node:assert/strict";
import { CapabilityCatalog } from "../../apps/agents/src/capabilityCatalog";

async function main(){
  const catalog=new CapabilityCatalog([
    {capabilityId:"supplier_search",authorityClass:"GREEN",specialistAgentId:"procurement",specialistVersion:"1.0.0"},
    {capabilityId:"supplier_email",authorityClass:"YELLOW",specialistAgentId:"procurement",specialistVersion:"1.0.0"},
    {capabilityId:"catalog_update",authorityClass:"YELLOW",specialistAgentId:"commerce",specialistVersion:"2.1.0"}
  ]);

  assert.equal(catalog.get("supplier_email").authorityClass,"YELLOW");
  assert.equal(catalog.specialists.ownerOf("supplier_search").agentId,"procurement");
  assert.equal(catalog.specialists.ownerOf("catalog_update").agentId,"commerce");

  const policies=catalog.authorityPolicies();
  assert.equal(policies.supplier_search,"GREEN");
  assert.equal(policies.supplier_email,"YELLOW");

  let unknown=false;
  try{catalog.get("unknown");}catch{unknown=true;}
  assert.equal(unknown,true);

  let duplicate=false;
  try{
    new CapabilityCatalog([
      {capabilityId:"x",authorityClass:"GREEN",specialistAgentId:"a",specialistVersion:"1"},
      {capabilityId:"x",authorityClass:"YELLOW",specialistAgentId:"b",specialistVersion:"1"}
    ]);
  }catch{duplicate=true;}
  assert.equal(duplicate,true);

  let versionConflict=false;
  try{
    new CapabilityCatalog([
      {capabilityId:"a1",authorityClass:"GREEN",specialistAgentId:"a",specialistVersion:"1"},
      {capabilityId:"a2",authorityClass:"GREEN",specialistAgentId:"a",specialistVersion:"2"}
    ]);
  }catch{versionConflict=true;}
  assert.equal(versionConflict,true);

  console.log("PHASE3_CAPABILITY_CATALOG PASS");
}
main();
