import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeBasePublishingLayer } from "@/lib/productionLayers";

export default async function KbPublishGatePage() {
  const layer = await buildKnowledgeBasePublishingLayer();
  return <LayerPage eyebrow="KB Publishing Pipeline" title="Publish gate" description="Requires reviewer, release note, guardrail check, fallback check, and smoke test evidence before applying changes." metrics={layer.metrics} items={layer.publishGate} exportHref="/api/admin/kb-publishing-pack.html" />;
}
