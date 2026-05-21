import { LayerPage } from "@/components/LayerPage";
import { buildSupportIntegrationLayer } from "@/lib/extendedPhaseLayers";

export default async function SupportIntegrationPackPage() {
  const layer = await buildSupportIntegrationLayer();
  return <LayerPage eyebrow="Support Integration" title="Support integration HTML pack" description="Exportable IT/LMS/student services review pack with routing rules, destinations, templates, privacy boundaries, and integration decisions." metrics={layer.metrics} items={layer.routingRules} exportHref="/api/admin/support-integration-pack.html" />;
}
