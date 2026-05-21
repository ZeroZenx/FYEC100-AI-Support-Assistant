import { LayerPage } from "@/components/LayerPage";
import { buildDeploymentAutomationLayer } from "@/lib/finalPhaseLayers";

export default async function DeploymentEvidencePackPage() {
  const layer = await buildDeploymentAutomationLayer();
  return <LayerPage eyebrow="Deployment Automation" title="Deployment evidence HTML pack" description="Exportable deployment readiness, script verification, IIS checks, restart runbook, and smoke command evidence." metrics={layer.metrics} items={layer.commandCenter} exportHref="/api/admin/deployment-evidence-pack.html" />;
}
