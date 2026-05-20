import { LayerPage } from "@/components/LayerPage";
import { buildOperationsLayer } from "@/lib/institutionalLayers";

export default async function OperationsHandoffPage() {
  const layer = await buildOperationsLayer();
  return <LayerPage eyebrow="Operations" title="Operations handoff HTML pack" description="COSTAATT IT handoff view with health signals, alert rules, incident workflow, Windows VM notes, and escalation owners." metrics={layer.metrics} items={layer.runbookActions} exportHref="/api/admin/operations-handoff.html" />;
}
