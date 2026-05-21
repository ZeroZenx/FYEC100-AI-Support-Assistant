import { LayerPage } from "@/components/LayerPage";
import { buildLaunchControlLayer } from "@/lib/extendedPhaseLayers";

export default async function LaunchDayCommandCenterPage() {
  const layer = await buildLaunchControlLayer();
  return <LayerPage eyebrow="Launch Control" title="Launch day command center" description="Launch status, active checklist, owners, Moodle placement, app health, provider status, support readiness, and rollback readiness." metrics={layer.metrics} items={layer.commandCenter} exportHref="/api/admin/launch-control-pack.html" />;
}
