import { LayerPage } from "@/components/LayerPage";
import { buildEnterpriseReleaseManagementLayer } from "@/lib/extendedPhaseLayers";

export default async function ChangelogWorkspacePage() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return <LayerPage eyebrow="Release Management" title="Changelog workspace" description="Human-readable release notes for sponsors, lecturers, LMS admins, IT, governance, and students where appropriate." metrics={layer.metrics} items={layer.changelog} exportHref="/api/admin/enterprise-release-pack.html" />;
}
