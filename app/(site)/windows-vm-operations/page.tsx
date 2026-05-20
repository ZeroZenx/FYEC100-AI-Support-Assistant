import { LayerPage } from "@/components/LayerPage";
import { buildOperationsLayer } from "@/lib/institutionalLayers";

export default async function WindowsVmOperationsPage() {
  const layer = await buildOperationsLayer();
  return <LayerPage eyebrow="Operations" title="Windows VM operations dashboard" description="Windows service expectations, IIS proxy checks, log locations, backup reminders, rollback guidance, and smoke-test command." metrics={layer.metrics} items={layer.windowsDashboard} exportHref="/api/admin/operations-handoff.html" />;
}
