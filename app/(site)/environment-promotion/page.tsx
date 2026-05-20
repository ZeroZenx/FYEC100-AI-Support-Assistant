import { LayerPage } from "@/components/LayerPage";
import { buildMigrationLayer } from "@/lib/institutionalLayers";

export default async function EnvironmentPromotionPage() {
  const layer = await buildMigrationLayer();
  return <LayerPage eyebrow="Pilot to Production" title="Environment promotion checklist" description="Local to Moodle test to staging to production checks for env vars, secrets, storage, auth, LTI, IIS, Windows service, backup, rollback, and smoke tests." items={layer.promotion} exportHref="/api/admin/production-handover-pack.html" />;
}
