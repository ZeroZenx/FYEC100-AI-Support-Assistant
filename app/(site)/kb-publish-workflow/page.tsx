import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeBasePublishingLayer } from "@/lib/productionLayers";

export default async function KbPublishWorkflowPage() {
  const layer = await buildKnowledgeBasePublishingLayer();
  return <LayerPage eyebrow="KB Publishing Pipeline" title="Draft-to-publish workflow" description="Moves approved draft updates through checklist, release note, final confirmation, and publish-ready review." metrics={layer.metrics} items={layer.workflow} exportHref="/api/admin/kb-publishing-pack.html" />;
}
