import { LayerPage } from "@/components/LayerPage";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export default async function ServiceDeskIntakePage() {
  const layer = await buildServiceDeskLayer();
  return <LayerPage eyebrow="Production Service Desk" title="Service desk intake API" description="Converts feedback and escalation signals into structured service cases with owner, priority, category, status, source, and due date planning." metrics={layer.metrics} items={layer.cases} exportHref="/api/admin/service-desk-pack.html" />;
}
