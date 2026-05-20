import { LayerPage } from "@/components/LayerPage";
import { buildOperationsLayer } from "@/lib/institutionalLayers";

export default async function AlertsPlanPage() {
  const layer = await buildOperationsLayer();
  return <LayerPage eyebrow="Operations" title="Operational alerts plan" description="Defines what should alert whom during real student use and hosted Moodle pilot operations." items={layer.alertsPlan} exportHref="/api/admin/operations-handoff.html" />;
}
