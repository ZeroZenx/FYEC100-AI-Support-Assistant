import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function ProductionDeploymentRunPage() {
  return (
    <PageShell
      eyebrow="Deployment Run"
      title="Production release deployment run"
      description="Run a controlled deployment with pre-checks, deploy steps, post-checks, rollback decision, incident notes, and completion sign-off."
    >
      <ProductionWorkflowBoard workflowId="production-deployment-run" />
    </PageShell>
  );
}
