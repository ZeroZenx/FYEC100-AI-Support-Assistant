import { LaunchChecklistClient } from "@/components/feature/LaunchChecklistClient";
import { PageShell } from "@/components/PageShell";

export default function LaunchChecklistExecutionPage() {
  return (
    <PageShell
      eyebrow="Launch Workflow"
      title="Launch checklist execution"
      description="Run the launch-day checklist as an active workflow with owners, status updates, notes, decisions, and a local timeline."
    >
      <LaunchChecklistClient />
    </PageShell>
  );
}
