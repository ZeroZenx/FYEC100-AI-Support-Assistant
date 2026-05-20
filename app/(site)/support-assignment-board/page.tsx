import { LayerPage } from "@/components/LayerPage";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export default async function SupportAssignmentBoardPage() {
  const layer = await buildServiceDeskLayer();
  return <LayerPage eyebrow="Production Service Desk" title="Support assignment board" description="Operational board for Project Lead, Lecturer, LMS Administrator, Developer, and System Administrator case ownership." metrics={layer.metrics} items={layer.cases} exportHref="/api/admin/service-desk-pack.html" />;
}
