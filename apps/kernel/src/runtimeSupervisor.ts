import { relayOutboxUntilEmpty } from "./outboxRelay";
import { processNextKernelEventAtomic } from "./eventConsumer";
import { recoverKernelAfterRestart } from "./recovery";
import { runOneClaimedWork, type CapabilityExecutor } from "./workerRuntime";

export interface RuntimeTickResult {
  recovered: {
    expiredLeases: string[];
    dueGoals: string[];
    finishedPlans: string[];
  };
  relayedOutbox: number;
  processedEvents: number;
  processedWork: boolean;
  executionId?: string;
}

export async function runKernelTick(input: {
  owner: string;
  ttlSeconds: number;
  executors: Record<string, CapabilityExecutor>;
  maxEventBatch?: number;
  maxOutboxBatch?: number;
}): Promise<RuntimeTickResult> {
  const recovered = await recoverKernelAfterRestart();

  const relayedOutbox = await relayOutboxUntilEmpty(input.maxOutboxBatch ?? 100);

  let processedEvents = 0;
  const maxEvents = input.maxEventBatch ?? 100;
  while (processedEvents < maxEvents) {
    const next = await processNextKernelEventAtomic();
    if (!next.processed) break;
    processedEvents += 1;
  }

  const work = await runOneClaimedWork(input.owner, input.ttlSeconds, input.executors);

  return {
    recovered,
    relayedOutbox,
    processedEvents,
    processedWork: work.processed,
    executionId: work.executionId
  };
}
