import { LayerPage } from "@/components/LayerPage";
import { buildMonitoringAlertingLayer } from "@/lib/finalPhaseLayers";

export default async function RunbookActionLinksPage() {
  const layer = await buildMonitoringAlertingLayer();
  return <LayerPage eyebrow="Monitoring" title="Runbook action links" description="Direct route from incidents to the correct runbook, Moodle check, evaluation run, or evidence export." metrics={layer.metrics} items={layer.runbookLinks} exportHref="/api/admin/operations-pack.html" />;
}
