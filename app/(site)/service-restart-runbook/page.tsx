import { LayerPage } from "@/components/LayerPage";
import { buildDeploymentAutomationLayer } from "@/lib/finalPhaseLayers";

export default async function ServiceRestartRunbookPage() {
  const layer = await buildDeploymentAutomationLayer();
  return <LayerPage eyebrow="Deployment Automation" title="Service restart runbook" description="NSSM, PM2, manual start, log inspection, and post-restart smoke test guidance for Windows VM operations." metrics={layer.metrics} items={layer.restartRunbook} exportHref="/api/admin/deployment-evidence-pack.html" />;
}
