import { LayerPage } from "@/components/LayerPage";
import { buildEnterpriseReleaseManagementLayer } from "@/lib/extendedPhaseLayers";

export default async function ReleaseRegisterPage() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return <LayerPage eyebrow="Release Management" title="Release register" description="Tracks app releases, KB releases, Moodle placement changes, provider config, auth/storage, and infrastructure changes." metrics={layer.metrics} items={layer.register} exportHref="/api/admin/enterprise-release-pack.html" />;
}
