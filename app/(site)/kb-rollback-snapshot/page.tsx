import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeBasePublishingLayer } from "@/lib/productionLayers";

export default async function KbRollbackSnapshotPage() {
  const layer = await buildKnowledgeBasePublishingLayer();
  return <LayerPage eyebrow="KB Publishing Pipeline" title="Rollback snapshot" description="Plans a restorable copy of the previous FYEC100 knowledge base version before publishing approved changes." items={layer.publishGate} exportHref="/api/admin/kb-publishing-pack.html" />;
}
