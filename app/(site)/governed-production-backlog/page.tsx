import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function GovernedProductionBacklogPage() {
  return (
    <PageShell
      eyebrow="Production Roadmap"
      title="Governed production platform backlog"
      description="Track production backlog items with priority, owners, risks, dependencies, acceptance criteria, and release grouping."
    >
      <ProductionWorkflowBoard workflowId="governed-production-backlog" />
    </PageShell>
  );
}
