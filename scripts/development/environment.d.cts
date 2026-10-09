import type { Client } from "pg";
export interface DevelopmentConfig {
  databaseName: string;
  schema: string;
  legalEntityId: string;
  orgId?: string;
  role?: string;
  autonomy?: boolean;
}
export interface DevelopmentTarget { databaseName: string; clusterIdentifier: string }
export function developmentEnvironment(schema?: string): NodeJS.ProcessEnv & {DATABASE_URL:string;PGOPTIONS:string};
export function databaseClient(env:NodeJS.ProcessEnv):Client;
export function assertDevelopmentIdentity(client:Client,target?:DevelopmentTarget):Promise<void>;
export function readConfig():DevelopmentConfig;
export function readTarget():DevelopmentTarget;
export function checkDatabase(env:NodeJS.ProcessEnv,config:DevelopmentConfig):Promise<void>;
export type DevelopmentEnvironment = NodeJS.ProcessEnv & {DATABASE_URL:string;PGOPTIONS:string};
export function serviceEnvironment(service:"command-center",config?:DevelopmentConfig):DevelopmentEnvironment & {SAM_COMMAND_CENTER_BEARER_TOKEN:string};
export function serviceEnvironment(service:"mcp",config?:DevelopmentConfig):DevelopmentEnvironment & {SAM_MCP_BEARER_TOKEN:string};
export function serviceEnvironment(service:string,config?:DevelopmentConfig):DevelopmentEnvironment;
export const root:string;
export const configPath:string;
export const schema:string;
