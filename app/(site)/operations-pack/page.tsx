import { LayerPage } from "@/components/LayerPage";
import { buildMonitoringAlertingLayer } from "@/lib/finalPhaseLayers";

export default async function OperationsPackPage() {
  const layer = await buildMonitoringAlertingLayer();
  return <LayerPage eyebrow="Monitoring" title="Operations HTML pack" description="Exportable monitoring and alerting pack for IT handoff and weekly pilot operations review." metrics={layer.metrics} items={layer.alertRules} exportHref="/api/admin/operations-pack.html" />;
}
