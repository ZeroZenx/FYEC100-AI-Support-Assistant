import { LayerPage } from "@/components/LayerPage";
import { buildDeploymentAutomationLayer } from "@/lib/finalPhaseLayers";

export default async function IisProxyVerificationPage() {
  const layer = await buildDeploymentAutomationLayer();
  return <LayerPage eyebrow="Deployment Automation" title="IIS proxy verification checklist" description="IIS ARR/URL Rewrite, HTTPS termination, forwarded headers, iframe behavior, and rollback checks." metrics={layer.metrics} items={layer.iisChecklist} exportHref="/api/admin/deployment-evidence-pack.html" />;
}
