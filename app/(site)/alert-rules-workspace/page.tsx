import { LayerPage } from "@/components/LayerPage";
import { buildMonitoringAlertingLayer } from "@/lib/finalPhaseLayers";

export default async function AlertRulesWorkspacePage() {
  const layer = await buildMonitoringAlertingLayer();
  return <LayerPage eyebrow="Monitoring" title="Alert rules workspace" description="Alert triggers and ownership for launch failures, provider outages, audit failures, support backlog, iframe issues, and evaluation regressions." metrics={layer.metrics} items={layer.alertRules} exportHref="/api/admin/operations-pack.html" />;
}
