import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildKnowledgeBaseContentOperationsLayer } from "@/lib/outcomesOperationsLayers";

export default async function ContentReleaseFlowPage() {
  const layer = await buildKnowledgeBaseContentOperationsLayer();

  return (
    <PageShell
      eyebrow="Knowledge Base Operations"
      title="Content approval release flow"
      description="Approval steps for draft changes, apply checklist, release notes, reviewer sign-off, and publish-ready status."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/kb-content-ops-pack.html" label="Open KB Ops HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.releaseFlow.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
