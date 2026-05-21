import { LayerPage } from "@/components/LayerPage";
import { buildPilotCloseoutScaleLayer } from "@/lib/finalPhaseLayers";

export default async function ScaleDecisionDashboardPage() {
  const layer = await buildPilotCloseoutScaleLayer();
  return <LayerPage eyebrow="Closeout" title="Scale decision dashboard" description="Continue, revise, expand, or pause recommendation based on readiness, evaluation, provider, LTI, and pilot outcomes evidence." metrics={layer.metrics} items={layer.scaleDecision} exportHref="/api/admin/pilot-closeout-scale-pack.html" />;
}
