import { ProductionWorkflowBoard } from "@/components/feature/ProductionWorkflowBoard";
import { PageShell } from "@/components/PageShell";

export default function ReleaseCandidateBuilderPage() {
  return (
    <PageShell
      eyebrow="Release Candidate"
      title="Release candidate builder"
      description="Package completed sprint items with test evidence, approvals, risk notes, rollback, and deployment target."
    >
      <ProductionWorkflowBoard workflowId="release-candidate-builder" />
    </PageShell>
  );
}
