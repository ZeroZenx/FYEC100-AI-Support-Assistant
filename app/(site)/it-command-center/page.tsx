import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function ItCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="IT and system admin command center" description="App health, Windows VM status, IIS proxy, logs, storage, deployment checks, provider status, and rollback signals." metrics={layer.metrics} items={layer.roles.it} exportHref="/api/admin/role-command-center-pack.html" />;
}
