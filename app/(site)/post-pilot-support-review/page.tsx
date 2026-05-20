import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessList } from "@/components/ReadinessCards";
import { buildStudentSupportOperationsLayer } from "@/lib/outcomesOperationsLayers";

export default async function PostPilotSupportReviewPage() {
  const layer = await buildStudentSupportOperationsLayer();

  return (
    <PageShell
      eyebrow="Student Support Operations"
      title="Post-pilot support review"
      description="A review page for what students asked for, common support categories, scale fixes, knowledge base candidates, and human-led support boundaries."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/support-operations-pack.html" label="Open Support Ops HTML Pack" />
      </section>
      <section className="mt-6">
        <ReadinessList title="Review Prompts" items={layer.postPilotReview} />
      </section>
    </PageShell>
  );
}
