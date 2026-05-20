import { LayerPage } from "@/components/LayerPage";
import { buildMigrationLayer } from "@/lib/institutionalLayers";

export default async function ProductionConfigBlueprintPage() {
  const layer = await buildMigrationLayer();
  return <LayerPage eyebrow="Pilot to Production" title="Production configuration blueprint" description="Required production variables, URLs, secrets, Windows/IIS assumptions, Moodle values, storage decisions, and ownership." metrics={layer.metrics} items={layer.blueprint} exportHref="/api/admin/production-handover-pack.html" />;
}
