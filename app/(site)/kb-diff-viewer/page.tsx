import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeBasePublishingLayer } from "@/lib/productionLayers";

export default async function KbDiffViewerPage() {
  const layer = await buildKnowledgeBasePublishingLayer();
  return <LayerPage eyebrow="KB Publishing Pipeline" title="Knowledge base diff viewer" description="Human-readable section-by-section comparison of current FYEC100 content and proposed changes." items={layer.diffViewer} exportHref="/api/admin/kb-publishing-pack.html" />;
}
