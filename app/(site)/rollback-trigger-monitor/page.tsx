import { LayerPage } from "@/components/LayerPage";
import { buildLaunchControlLayer } from "@/lib/extendedPhaseLayers";

export default async function RollbackTriggerMonitorPage() {
  const layer = await buildLaunchControlLayer();
  return <LayerPage eyebrow="Launch Control" title="Rollback trigger monitor" description="Launch stop or rollback triggers for app outage, Moodle frame blocking, provider failure, unsafe behavior, privacy issues, or support overload." metrics={layer.metrics} items={layer.rollbackTriggers} exportHref="/api/admin/launch-control-pack.html" />;
}
