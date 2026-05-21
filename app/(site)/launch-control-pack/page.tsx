import { LayerPage } from "@/components/LayerPage";
import { buildLaunchControlLayer } from "@/lib/extendedPhaseLayers";

export default async function LaunchControlPackPage() {
  const layer = await buildLaunchControlLayer();
  return <LayerPage eyebrow="Launch Control" title="Launch control HTML pack" description="Exportable project record showing launch actions, owners, evidence, issues, rollback status, and review notes." metrics={layer.metrics} items={layer.commandCenter} exportHref="/api/admin/launch-control-pack.html" />;
}
