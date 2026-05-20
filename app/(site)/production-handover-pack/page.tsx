import { LayerPage } from "@/components/LayerPage";
import { buildMigrationLayer } from "@/lib/institutionalLayers";

export default async function ProductionHandoverPackPage() {
  const layer = await buildMigrationLayer();
  return <LayerPage eyebrow="Pilot to Production" title="Production handover pack" description="HTML export for IT, LMS, governance, sponsor, and developer handoff." metrics={layer.metrics} items={layer.readiness} exportHref="/api/admin/production-handover-pack.html" />;
}
