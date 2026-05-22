import { KbRegressionPublish } from "@/components/feature/KbRegressionPublish";
import { PageShell } from "@/components/PageShell";

export default function KbRegressionPublishPage() {
  return (
    <PageShell
      eyebrow="Knowledge Base Release Safety"
      title="KB regression, publish, and rollback"
      description="Run safety regression checks before publishing approved knowledge base updates with a rollback snapshot."
    >
      <KbRegressionPublish />
    </PageShell>
  );
}
