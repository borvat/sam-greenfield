import type {ToolAdapter,ToolExecutionRequest,ToolExecutionResult} from "../../../packages/tool-gateway/src/types";
import type {BolRetailerClient} from "../../../packages/bol/src/client";
import type {EBoekhoudenClient} from "../../../packages/eboekhouden/src/client";
import {reconcileExactReferences,outstandingSnapshot} from "../../finance/src/reconciliation";

export class FinanceReconciliationPreviewAdapter implements ToolAdapter{
  readonly capabilityId="finance_reconciliation_preview";
  constructor(private bol:BolRetailerClient,private accounting:EBoekhoudenClient){}
  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const p=request.params??{};
    const [bolInvoices,mutations]=await Promise.all([
      this.bol.listInvoices({periodStartDate:p.period_start_date,periodEndDate:p.period_end_date}),
      this.accounting.listMutations({limit:p.limit??100,offset:p.offset??0})
    ]);
    const preview=reconcileExactReferences(bolInvoices,mutations);
    return {result:{preview},evidence:{readback:true,matching_policy:"exact_reference_only",sources:["bol","eboekhouden"]}};
  }
}

export class FinanceOutstandingSnapshotAdapter implements ToolAdapter{
  readonly capabilityId="finance_outstanding_snapshot";
  constructor(private accounting:EBoekhoudenClient){}
  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const body=await this.accounting.getOutstandingInvoices({limit:request.params.limit??100,offset:request.params.offset??0});
    return {result:{snapshot:outstandingSnapshot(body)},evidence:{readback:true,source:"eboekhouden"}};
  }
}
