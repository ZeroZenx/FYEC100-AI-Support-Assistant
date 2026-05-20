import { LayerPage } from "@/components/LayerPage";
import { buildMigrationLayer } from "@/lib/institutionalLayers";

export default async function DataMigrationPlanPage() {
  const layer = await buildMigrationLayer();
  return <LayerPage eyebrow="Pilot to Production" title="Data migration plan" description="What pilot data is exported, retained, deleted, anonymized, or moved to approved production storage." items={layer.dataMigration} exportHref="/api/admin/production-handover-pack.html" />;
}
