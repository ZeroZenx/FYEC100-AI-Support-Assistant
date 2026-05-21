import { LayerPage } from "@/components/LayerPage";
import { buildMonitoringAlertingLayer } from "@/lib/finalPhaseLayers";

export default async function OperationsCommandDashboardPage() {
  const layer = await buildMonitoringAlertingLayer();
  return <LayerPage eyebrow="Monitoring" title="Operations command dashboard" description="Single operations view for app health, Moodle/LTI status, provider status, storage, evaluation, support, and warnings." metrics={layer.metrics} items={layer.commandDashboard} exportHref="/api/admin/operations-pack.html" />;
}
