import { LayerPage } from "@/components/LayerPage";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export default async function SupportCaseLifecyclePage() {
  const layer = await buildServiceDeskLayer();
  return <LayerPage eyebrow="Production Service Desk" title="Support case lifecycle" description="Operational statuses for new, assigned, in-progress, waiting, resolved, and closed service desk cases." listItems={layer.caseLifecycle} exportHref="/api/admin/service-desk-pack.html" />;
}
