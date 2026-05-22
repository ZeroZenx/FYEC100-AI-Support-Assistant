import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function EnterpriseRolloutBlueprintPage() {
  return (
    <PageShell
      eyebrow="Enterprise Rollout"
      title="Enterprise rollout blueprint"
      description="Define the service model, rollout waves, technical target, support model, governance standard, and communications plan."
    >
      <ProductionWorkflowBoard workflowId="enterprise-rollout-blueprint" />
    </PageShell>
  );
}
