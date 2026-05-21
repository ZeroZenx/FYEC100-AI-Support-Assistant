import { LayerPage } from "@/components/LayerPage";
import { buildEnterpriseReleaseManagementLayer } from "@/lib/extendedPhaseLayers";

export default async function ReleaseCalendarPage() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return <LayerPage eyebrow="Release Management" title="Release calendar" description="Release windows, teaching-week sensitivity, blackout periods, assessment deadline cautions, and post-release review timing." metrics={layer.metrics} items={layer.calendar} exportHref="/api/admin/enterprise-release-pack.html" />;
}
