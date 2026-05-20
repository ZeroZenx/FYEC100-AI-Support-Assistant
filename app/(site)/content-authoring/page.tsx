import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildKnowledgeBaseContentOperationsLayer } from "@/lib/outcomesOperationsLayers";

export default async function ContentAuthoringPage() {
  const layer = await buildKnowledgeBaseContentOperationsLayer();

  return (
    <PageShell
      eyebrow="Knowledge Base Operations"
      title="Content authoring workspace"
      description="A staff-friendly page for proposed FYEC100 content updates, course section mapping, source and reason labels, reviewer assignment, and priority."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(layer.metrics).map(([label, value]) => (
            <ReadinessMetric key={label} label={label} value={value} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/kb-content-ops-pack.html" label="Open KB Ops HTML Pack" />
          <ReadinessLink href="/kb-version-comparison" label="Compare Versions" />
        </div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.authoringQueue.length > 0 ? (
          layer.authoringQueue.map((item) => (
            <ReadinessRecord key={item.label} {...item} />
          ))
        ) : (
          <ReadinessRecord
            detail="No draft or pending content update is currently queued."
            label="No active authoring queue"
            owner="Lecturer / Content Owner"
            status="ready"
          />
        )}
      </section>
    </PageShell>
  );
}
