import { recoverKernelAfterRestart } from "../../kernel/src/recovery";
import { relayOutboxUntilEmpty } from "../../kernel/src/outboxRelay";
import { processNextKernelEventAtomic } from "../../kernel/src/eventConsumer";
import type { RuntimeComposition } from "./service";
import { autonomyEnabled } from "../../development/src/autonomyBoundary";
import { localCapabilityBundle } from "../../development/src/localCapabilities";
import { createProductionComposition } from "../../production/src/composition";

if (process.env.SAM_DEVELOPMENT_SAFE_MODE !== "1" || process.env.NODE_ENV !== "development") {
  throw new Error("Maintenance-only composition is restricted to isolated development.");
}

let ticks = 0;
const autonomy=autonomyEnabled()?createProductionComposition({
  bundle:localCapabilityBundle(),workerId:process.env.SAM_WORKER_ID??"sam-autonomy"
}):null;
const composition: RuntimeComposition = {
  supervisorOptions:autonomy?{monitorSideEffects:false}:undefined,
  async runWorkTick() {
    const recovered = await recoverKernelAfterRestart();
    const autonomous=autonomy?await autonomy.runWorkTick():null;
    const relayed = await relayOutboxUntilEmpty(100);
    let events = 0;
    while (events < 100) {
      const event = await processNextKernelEventAtomic();
      if (!event.processed) break;
      events++;
    }
    ticks++;
    if (ticks === 1 || ticks % 30 === 0) {
      console.log(JSON.stringify({
        service: "sam-development-worker", ticks, relayed, events,
        mode: autonomy?"bounded-synthetic-autonomy":"maintenance-only", planning: autonomy?"bounded-approved":"disabled",
        capabilityExecution: autonomy?"local-only":"disabled", externalAdapters: "disabled"
      }));
    }
    // No planner, executor, external reconciler, financial loop, or fabricated verifier.
    // Original recovery, event fabric and operational supervisor remain active.
    return { recovered, relayed, events,autonomous };
  }
};

export default composition;
