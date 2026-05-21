import { LayerPage } from "@/components/LayerPage";
import { buildEnterpriseReleaseManagementLayer } from "@/lib/extendedPhaseLayers";

export default async function EnterpriseReleasePackPage() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return <LayerPage eyebrow="Release Management" title="Enterprise release HTML pack" description="Exportable release pack for change advisory or leadership review." metrics={layer.metrics} items={layer.approvalGate} exportHref="/api/admin/enterprise-release-pack.html" />;
}
