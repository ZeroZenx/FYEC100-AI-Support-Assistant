import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function ReadinessReviewBoardPage() {
  return (
    <PageShell
      eyebrow="Review Board"
      title="Production readiness review board"
      description="Review, approve, defer, reject, or request more evidence for production backlog items."
    >
      <ProductionWorkflowBoard workflowId="readiness-review-board" />
    </PageShell>
  );
}
