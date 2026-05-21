import { LayerPage } from "@/components/LayerPage";
import { buildPilotCloseoutScaleLayer } from "@/lib/finalPhaseLayers";

export default async function PilotCloseoutScalePackPage() {
  const layer = await buildPilotCloseoutScaleLayer();
  return <LayerPage eyebrow="Closeout" title="Pilot closeout and scale decision pack" description="Exportable closeout and scale decision evidence for COSTAATT project leadership." metrics={layer.metrics} items={[...layer.scaleDecision, ...layer.closeout]} exportHref="/api/admin/pilot-closeout-scale-pack.html" />;
}
