import { LayerPage } from "@/components/LayerPage";
import { buildDeploymentAutomationLayer } from "@/lib/finalPhaseLayers";

export default async function WindowsScriptVerificationPage() {
  const layer = await buildDeploymentAutomationLayer();
  return <LayerPage eyebrow="Deployment Automation" title="Windows script verification" description="Checks that the required Windows VM PowerShell deployment and service scripts are present." metrics={layer.metrics} items={layer.scripts} exportHref="/api/admin/windows-script-verification" exportLabel="Open Verification API" />;
}
