import { LayerPage } from "@/components/LayerPage";
import { buildContentReleaseControlLayer } from "@/lib/finalPhaseLayers";

export default async function KbReleaseControlPackPage() {
  const layer = await buildContentReleaseControlLayer();
  return <LayerPage eyebrow="Content Release" title="KB release control HTML pack" description="Exportable knowledge base publishing evidence with drafts, diff review, gates, preview, rollback, and release notes." metrics={layer.metrics} items={layer.approvalGate} exportHref="/api/admin/kb-release-control-pack.html" />;
}
