import { LayerPage } from "@/components/LayerPage";
import { buildMigrationLayer } from "@/lib/institutionalLayers";

export default async function CutoverRollbackPage() {
  const layer = await buildMigrationLayer();
  return <LayerPage eyebrow="Pilot to Production" title="Cutover and rollback plan" description="Step-by-step go-live and rollback plan with triggers, owners, timing, and communication notes." items={layer.cutoverRollback} exportHref="/api/admin/production-handover-pack.html" />;
}
