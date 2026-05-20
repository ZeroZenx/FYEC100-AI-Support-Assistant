import { LayerPage } from "@/components/LayerPage";
import { buildOperationsLayer } from "@/lib/institutionalLayers";

export default async function RunbookActionCenterPage() {
  const layer = await buildOperationsLayer();
  return <LayerPage eyebrow="Operations" title="Runbook action center" description="Common operating actions linked to restart, env checks, smoke tests, Moodle config, evidence export, and stop-pilot workflow." items={layer.runbookActions} exportHref="/api/admin/operations-handoff.html" />;
}
