import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function ScaleDecisionApprovalPage() {
  return (
    <PageShell
      eyebrow="Institutional Decision"
      title="Scale decision and institutional approval"
      description="Package pilot evidence into a formal continue, revise, expand, pause, or retire decision workflow."
    >
      <ProductionWorkflowBoard workflowId="scale-decision-approval" />
    </PageShell>
  );
}
