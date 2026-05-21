import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function GovernanceCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="Governance command center" description="Privacy, audit, retention, provider policy, evaluation safety, risks, and approval readiness." metrics={layer.metrics} items={layer.roles.governance} exportHref="/api/admin/role-command-center-pack.html" />;
}
