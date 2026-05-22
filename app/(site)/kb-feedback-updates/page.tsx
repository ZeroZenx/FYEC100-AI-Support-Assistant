import { KbFeedbackUpdates } from "@/components/feature/KbFeedbackUpdates";
import { PageShell } from "@/components/PageShell";

export default function KbFeedbackUpdatesPage() {
  return (
    <PageShell
      eyebrow="Knowledge Base Feedback Loop"
      title="KB updates from student feedback"
      description="Group repeated missing-information feedback into lecturer-reviewable knowledge base update suggestions."
    >
      <KbFeedbackUpdates />
    </PageShell>
  );
}
