import * as z from "zod/v4";

type JsonSchema={
  type?:string;
  enum?:unknown[];
  properties?:Record<string,JsonSchema>;
  required?:string[];
  items?:JsonSchema;
  additionalProperties?:boolean|JsonSchema;
  minimum?:number;
  maximum?:number;
};

function valueSchema(schema:JsonSchema):z.ZodTypeAny{
  if(Array.isArray(schema.enum)&&schema.enum.length>0){
    if(schema.enum.every((v)=>typeof v==="string")){
      return z.enum(schema.enum as [string,...string[]]);
    }
    throw new Error("Only string enums are supported in MCP tool schemas");
  }

  switch(schema.type){
    case "string":
      return z.string();
    case "integer":{
      let result=z.number().int();
      if(typeof schema.minimum==="number") result=result.min(schema.minimum);
      if(typeof schema.maximum==="number") result=result.max(schema.maximum);
      return result;
    }
    case "number":{
      let result=z.number();
      if(typeof schema.minimum==="number") result=result.min(schema.minimum);
      if(typeof schema.maximum==="number") result=result.max(schema.maximum);
      return result;
    }
    case "boolean":
      return z.boolean();
    case "array":
      return z.array(schema.items?valueSchema(schema.items):z.unknown());
    case "object":{
      if(schema.properties){
        return objectSchema(schema);
      }
      return z.record(z.string(),z.unknown());
    }
    default:
      return z.unknown();
  }
}

export function objectSchema(schema:JsonSchema):z.ZodObject<any>{
  if(schema.type!=="object"){
    throw new Error("MCP input schema root must be an object");
  }

  const required=new Set(schema.required??[]);
  const shape:Record<string,z.ZodTypeAny>={};
  for(const [name,property] of Object.entries(schema.properties??{})){
    const value=valueSchema(property);
    shape[name]=required.has(name)?value:value.optional();
  }

  const result=z.object(shape);
  return schema.additionalProperties===false?result.strict():result;
}

export function chatGPTInputSchemaToZod(schema:Record<string,unknown>):z.ZodObject<any>{
  return objectSchema(schema as JsonSchema);
}
