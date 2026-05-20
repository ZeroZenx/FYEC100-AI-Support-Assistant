import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeBasePublishingLayer } from "@/lib/productionLayers";

export default async function KbReleasePackPage() {
  const layer = await buildKnowledgeBasePublishingLayer();
  return <LayerPage eyebrow="KB Publishing Pipeline" title="Knowledge base release HTML pack" description="Non-technical release report showing what changed, why, who approved it, and what risks remain." metrics={layer.metrics} items={layer.diffViewer} exportHref="/api/admin/kb-publishing-pack.html" />;
}
