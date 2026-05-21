import { LayerPage } from "@/components/LayerPage";
import { buildLaunchControlLayer } from "@/lib/extendedPhaseLayers";

export default async function LaunchCommunicationsWorkspacePage() {
  const layer = await buildLaunchControlLayer();
  return <LayerPage eyebrow="Launch Control" title="Launch communications workspace" description="Draft and track student notice, lecturer note, LMS admin notice, IT standby note, sponsor update, and fallback message." metrics={layer.metrics} items={layer.communications} exportHref="/api/admin/launch-control-pack.html" />;
}
