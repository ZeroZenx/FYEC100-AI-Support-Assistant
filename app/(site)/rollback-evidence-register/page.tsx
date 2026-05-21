import { LayerPage } from "@/components/LayerPage";
import { buildEnterpriseReleaseManagementLayer } from "@/lib/extendedPhaseLayers";

export default async function RollbackEvidenceRegisterPage() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return <LayerPage eyebrow="Release Management" title="Rollback evidence register" description="Rollback triggers, previous version, backup location, owner, smoke result, and recovery notes." metrics={layer.metrics} items={layer.rollback} exportHref="/api/admin/enterprise-release-pack.html" />;
}
