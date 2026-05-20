import { LayerPage } from "@/components/LayerPage";
import { buildMigrationLayer } from "@/lib/institutionalLayers";

export default async function MigrationReadinessPage() {
  const layer = await buildMigrationLayer();
  return <LayerPage eyebrow="Pilot to Production" title="Migration readiness dashboard" description="Shows what can stay as-is, what must change, and what needs approval before production." metrics={layer.metrics} items={layer.readiness} exportHref="/api/admin/production-handover-pack.html" />;
}
