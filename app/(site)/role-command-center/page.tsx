import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function RoleCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="Role-based command center" description="Focused dashboards for sponsor, project lead, LMS admin, lecturer, IT, governance, and developer roles." metrics={layer.metrics} items={[...layer.roles.sponsor, ...layer.roles.projectLead, ...layer.roles.lmsAdmin, ...layer.roles.lecturer, ...layer.roles.it, ...layer.roles.governance, ...layer.roles.developer]} exportHref="/api/admin/role-command-center-pack.html" />;
}
