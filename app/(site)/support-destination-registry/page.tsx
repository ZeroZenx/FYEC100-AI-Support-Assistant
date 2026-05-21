import { LayerPage } from "@/components/LayerPage";
import { buildSupportIntegrationLayer } from "@/lib/extendedPhaseLayers";

export default async function SupportDestinationRegistryPage() {
  const layer = await buildSupportIntegrationLayer();
  return <LayerPage eyebrow="Support Integration" title="Support destination registry" description="Defines official destinations for lecturer follow-up, LMS admin, IT help desk, academic support, governance/privacy, and project team." metrics={layer.metrics} items={layer.destinations} exportHref="/api/admin/support-integration-pack.html" />;
}
