'use strict';
/** Offline metadata validation and explicit link only. Never downloads or runs package scripts. */
const fs=require('node:fs'),path=require('node:path'),common=require('./common.cjs');
try{
 const artifacts=common.verifyRuntimeArtifacts(true),deps=artifacts.dependencyRoot;
 if(process.argv[2]&&fs.realpathSync(process.argv[2])!==fs.realpathSync(deps))throw Error('DEPENDENCY_ROOT_DIFFERS_FROM_REVIEWED_ARTIFACT');if(!deps||!path.isAbsolute(deps)||!fs.statSync(deps).isDirectory())throw Error('EXPLICIT_ABSOLUTE_DEPENDENCY_DIRECTORY_REQUIRED');
 const failures=[];
 for(const name of Object.keys(common.PINS.sources)){
  common.verifySource(name);const root=common.root(name),lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
  for(const [packagePath,pin] of Object.entries(lock.packages||{})){
   if(!packagePath.startsWith('node_modules/')||pin.link||pin.dev||!pin.version)continue;
   const installed=path.join(deps,packagePath.slice('node_modules/'.length),'package.json');
   if(!fs.existsSync(installed)){if(!pin.optional)failures.push({source:name,package:packagePath,error:'MISSING'});continue;}
   const actual=JSON.parse(fs.readFileSync(installed,'utf8')).version;if(actual!==pin.version)failures.push({source:name,package:packagePath,expected:pin.version,actual});
  }
 }
 if(failures.length){console.log(JSON.stringify({status:'BLOCKED_DEPENDENCY_LOCK_MISMATCH',failures}));process.exitCode=1;}
 else{for(const name of Object.keys(common.PINS.sources)){const target=path.join(common.root(name),'node_modules');if(fs.existsSync(target)){if(fs.realpathSync(target)!==fs.realpathSync(deps))throw Error('DIFFERENT_DEPENDENCY_LINK_ALREADY_EXISTS');}else fs.symlinkSync(deps,target,'dir');}console.log(JSON.stringify({status:'REVIEWED_ARTIFACT_BYTES_AND_LOCK_METADATA_MATCH_AND_LINKED',databaseConnected:false,installedOrDownloaded:false,limits:'Official Node archive/checksum and binary plus reviewed dependency archive/complete unpacked tree hashes verified; reviewer-provided provenance remains required.'}));}
}catch(error){console.error(JSON.stringify(common.safeError(error)));process.exitCode=1;}
