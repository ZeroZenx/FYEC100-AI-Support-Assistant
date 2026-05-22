import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function MaintenanceSchedulerPage() {
  return (
    <PageShell
      eyebrow="Operations"
      title="Operational maintenance scheduler"
      description="Track recurring KB, provider, Moodle, backup, support, accessibility, and governance reviews."
    >
      <ProductionWorkflowBoard workflowId="maintenance-scheduler" />
    </PageShell>
  );
}
