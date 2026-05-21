import { LayerPage } from "@/components/LayerPage";
import { buildEnterpriseReleaseManagementLayer } from "@/lib/extendedPhaseLayers";

export default async function ReleaseApprovalGatePage() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return <LayerPage eyebrow="Release Management" title="Release approval gate" description="Evidence gate for build, smoke, evaluation, KB approval, rollback readiness, and owner approval." metrics={layer.metrics} items={layer.approvalGate} exportHref="/api/admin/enterprise-release-pack.html" />;
}
