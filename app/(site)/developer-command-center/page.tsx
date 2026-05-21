import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function DeveloperCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="Developer command center" description="Route health, API checks, provider config, smoke tests, unresolved technical issues, storage, and diagnostics." metrics={layer.metrics} items={layer.roles.developer} exportHref="/api/admin/role-command-center-pack.html" />;
}
