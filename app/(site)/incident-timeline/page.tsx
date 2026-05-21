import { LayerPage } from "@/components/LayerPage";
import { buildMonitoringAlertingLayer } from "@/lib/finalPhaseLayers";

export default async function IncidentTimelinePage() {
  const layer = await buildMonitoringAlertingLayer();
  return <LayerPage eyebrow="Monitoring" title="Incident timeline" description="Readable operational event stream for provider failures, LTI launch failures, route errors, failed access, smoke failures, and storage issues." metrics={layer.metrics} items={layer.incidentTimeline} exportHref="/api/admin/operations-pack.html" />;
}
