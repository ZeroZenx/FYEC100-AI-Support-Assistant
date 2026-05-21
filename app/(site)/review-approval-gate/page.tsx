import { LayerPage } from "@/components/LayerPage";
import { buildContentReleaseControlLayer } from "@/lib/finalPhaseLayers";

export default async function ReviewApprovalGatePage() {
  const layer = await buildContentReleaseControlLayer();
  return <LayerPage eyebrow="Content Release" title="Review and approval gate" description="Reviewer, release note, academic integrity check, fallback check, and content-owner sign-off before publishing." metrics={layer.metrics} items={layer.approvalGate} exportHref="/api/admin/kb-release-control-pack.html" />;
}
