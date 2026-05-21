import { LayerPage } from "@/components/LayerPage";
import { buildDeploymentAutomationLayer } from "@/lib/finalPhaseLayers";

export default async function DeploymentCommandCenterPage() {
  const layer = await buildDeploymentAutomationLayer();
  return <LayerPage eyebrow="Deployment Automation" title="Deployment command center" description="Windows VM deployment commands, expected path, port, smoke test, and readiness warnings." metrics={layer.metrics} items={layer.commandCenter} exportHref="/api/admin/deployment-evidence-pack.html" />;
}
