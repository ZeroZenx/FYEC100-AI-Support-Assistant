import { LayerPage } from "@/components/LayerPage";
import { buildLaunchControlLayer } from "@/lib/extendedPhaseLayers";

export default async function PostLaunchReviewWorkspacePage() {
  const layer = await buildLaunchControlLayer();
  return <LayerPage eyebrow="Launch Control" title="Post-launch review workspace" description="Captures what happened, issues found, support load, student signals, lessons learned, and next actions." metrics={layer.metrics} items={layer.postLaunch} exportHref="/api/admin/launch-control-pack.html" />;
}
