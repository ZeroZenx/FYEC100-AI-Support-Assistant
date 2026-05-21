import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function LmsAdminCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="LMS admin command center" description="Moodle placement, LTI configuration, launch diagnostics, iframe checks, and Moodle-related support signals." metrics={layer.metrics} items={layer.roles.lmsAdmin} exportHref="/api/admin/role-command-center-pack.html" />;
}
