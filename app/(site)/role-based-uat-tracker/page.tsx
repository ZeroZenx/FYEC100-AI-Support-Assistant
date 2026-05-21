import { LayerPage } from "@/components/LayerPage";
import { buildUatLayer } from "@/lib/extendedPhaseLayers";

export default async function RoleBasedUatTrackerPage() {
  const layer = await buildUatLayer();
  return <LayerPage eyebrow="UAT" title="Role-based UAT tracker" description="Tracks scripts as not started, in progress, passed, failed, blocked, or needing retest." metrics={layer.metrics} items={layer.tracker} exportHref="/api/admin/uat-evidence-pack.html" />;
}
