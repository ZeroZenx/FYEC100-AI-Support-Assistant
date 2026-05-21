import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function ProjectLeadCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="Project lead command center" description="Overall readiness, active blockers, support queue, governance status, deployment status, and next actions." metrics={layer.metrics} items={layer.roles.projectLead} exportHref="/api/admin/role-command-center-pack.html" />;
}
