"use strict";
// Synthetic transport only: importing this fixture prevents every PG connection.
const Module=require("node:module");
const original=Module._load;
Module._load=function(request,...args){
  if(request==="pg"){
    return {Client:class {
      constructor(){
        const error=new Error("SYNTHETIC_SECRET_SENTINEL sql=secret_query password=fixture_only");
        error.code="28P01";
        throw error;
      }
    }};
  }
  return original.call(this,request,...args);
};
