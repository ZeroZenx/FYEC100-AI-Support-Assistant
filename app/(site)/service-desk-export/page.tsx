import { LayerPage } from "@/components/LayerPage";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export default async function ServiceDeskExportPage() {
  const layer = await buildServiceDeskLayer();
  return <LayerPage eyebrow="Production Service Desk" title="Service desk export pack" description="Readable weekly support review export for pilot governance meetings and operational follow-up." metrics={layer.metrics} items={layer.cases} exportHref="/api/admin/service-desk-pack.html" />;
}
