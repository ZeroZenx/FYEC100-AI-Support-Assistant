import { LayerPage } from "@/components/LayerPage";
import { buildLaunchControlLayer } from "@/lib/extendedPhaseLayers";

export default async function LiveLaunchChecklistPage() {
  const layer = await buildLaunchControlLayer();
  return <LayerPage eyebrow="Launch Control" title="Live launch checklist" description="Step-by-step launch checklist for app health, Moodle placement, iframe/LTI launch, notices, monitoring, smoke test, and decision logging." metrics={layer.metrics} items={layer.checklist} exportHref="/api/admin/launch-control-pack.html" />;
}
