import { pathToFileURL } from "node:url";
import type { ProductionBundle } from "./types";
import { validateProductionBundle,type ValidatedProductionBundle } from "./bundle";

export async function loadProductionBundle(
  modulePath:string
):Promise<ValidatedProductionBundle>{
  if(!modulePath.trim()) throw new Error("SAM_PRODUCTION_BUNDLE_MODULE is required");
  const mod=await import(pathToFileURL(modulePath).href);
  const bundle=await (mod.default?.default??mod.default??mod.bundle??mod) as ProductionBundle;
  return validateProductionBundle(bundle);
}
