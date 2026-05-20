import { PageShell } from "@/components/PageShell";
import { ReadinessLink } from "@/components/ReadinessCards";
import { buildKnowledgeBasePublishingLayer } from "@/lib/productionLayers";

export default async function KbPreviewPage() {
  const layer = await buildKnowledgeBasePublishingLayer();
  return (
    <PageShell eyebrow="KB Publishing Pipeline" title="Knowledge base preview" description="Preview the future FYEC100 knowledge base before replacing the live Markdown file.">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/kb-publishing-pack.html" label="Open KB Publishing HTML Pack" />
        <pre className="mt-4 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">{layer.preview}</pre>
      </section>
    </PageShell>
  );
}
