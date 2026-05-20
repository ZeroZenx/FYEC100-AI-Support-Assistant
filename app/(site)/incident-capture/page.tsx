import { LayerPage } from "@/components/LayerPage";
import { buildOperationsLayer } from "@/lib/institutionalLayers";

export default async function IncidentCapturePage() {
  const layer = await buildOperationsLayer();
  return <LayerPage eyebrow="Operations" title="Error and incident event capture" description="Operational capture points for provider failures, LTI failures, route errors, rate limits, failed access, and support spikes." items={layer.incidentCapture} exportHref="/api/admin/operations-handoff.html" />;
}
