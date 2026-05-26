import { PageShell } from "@/components/PageShell";
import { Phase2GateWizard } from "@/components/feature/Phase2GateWizard";
import { SecondaryAction } from "@/components/ui/System";
import { buildPhase2CompletionGate } from "@/lib/phase2Completion";

export default async function Phase2GateWizardPage() {
  const gate = await buildPhase2CompletionGate();

  return (
    <PageShell
      actions={
        <>
          <SecondaryAction href="/phase-2-command-center">Command center</SecondaryAction>
          <SecondaryAction href="/reports">Reports library</SecondaryAction>
        </>
      }
      description="A compact, action-first workflow for finishing the remaining Phase 2 evidence before Phase 3 planning begins."
      eyebrow="Phase 2 Gate"
      title="Phase 2 gate execution wizard"
    >
      <Phase2GateWizard initialGate={gate} />
    </PageShell>
  );
}
