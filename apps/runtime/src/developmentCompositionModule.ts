import { recoverKernelAfterRestart } from "../../kernel/src/recovery";
import { relayOutboxUntilEmpty } from "../../kernel/src/outboxRelay";
import { processNextKernelEventAtomic } from "../../kernel/src/eventConsumer";
import type { RuntimeComposition } from "./service";

if (process.env.SAM_DEVELOPMENT_SAFE_MODE !== "1" || process.env.NODE_ENV !== "development") {
  throw new Error("Maintenance-only composition is restricted to isolated development.");
}

let ticks = 0;
const composition: RuntimeComposition = {
  async runWorkTick() {
    const recovered = await recoverKernelAfterRestart();
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
        mode: "maintenance-only", planning: "disabled",
        capabilityExecution: "disabled", externalAdapters: "disabled"
      }));
    }
    // No planner, executor, external reconciler, financial loop, or fabricated verifier.
    // Original recovery, event fabric and operational supervisor remain active.
    return { recovered, relayed, events };
  }
};

export default composition;
