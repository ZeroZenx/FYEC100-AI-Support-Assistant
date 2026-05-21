import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function SponsorCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="Sponsor command center" description="Pilot status, risks, decisions, milestone progress, benefits signals, and sign-off items for leadership." metrics={layer.metrics} items={layer.roles.sponsor} exportHref="/api/admin/role-command-center-pack.html" />;
}
