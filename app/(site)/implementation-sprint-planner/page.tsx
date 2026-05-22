import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function ImplementationSprintPlannerPage() {
  return (
    <PageShell
      eyebrow="Sprint Planning"
      title="Implementation sprint planner"
      description="Move approved backlog items into planned build phases with owners, reviewers, acceptance criteria, and verification checks."
    >
      <ProductionWorkflowBoard workflowId="implementation-sprint-planner" />
    </PageShell>
  );
}
