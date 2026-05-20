import { LayerPage } from "@/components/LayerPage";
import { buildOperationsLayer } from "@/lib/institutionalLayers";

export default async function OperationalHealthPage() {
  const layer = await buildOperationsLayer();
  return <LayerPage eyebrow="Operations" title="Operational health dashboard" description="Health, provider, Moodle/LTI, storage, service desk, rate limit, and recent operational readiness signals for IT." metrics={layer.metrics} items={layer.healthDashboard} exportHref="/api/admin/operations-handoff.html" />;
}
