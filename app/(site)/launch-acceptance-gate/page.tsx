import { LayerPage } from "@/components/LayerPage";
import { buildUatLayer } from "@/lib/extendedPhaseLayers";

export default async function LaunchAcceptanceGatePage() {
  const layer = await buildUatLayer();
  return <LayerPage eyebrow="UAT" title="Launch acceptance gate" description="Defines what must pass before launch: UAT, smoke, provider, KB, Moodle embed, support, and rollback readiness." metrics={layer.metrics} items={layer.launchGate} exportHref="/api/admin/uat-evidence-pack.html" />;
}
