import { LayerPage } from "@/components/LayerPage";
import { buildSupportIntegrationLayer } from "@/lib/extendedPhaseLayers";

export default async function SupportHandoffTemplateBuilderPage() {
  const layer = await buildSupportIntegrationLayer();
  return <LayerPage eyebrow="Support Integration" title="Support handoff template builder" description="Safe handoff summaries that exclude grades, passwords, student IDs, and sensitive personal information." metrics={layer.metrics} items={layer.handoffTemplates} exportHref="/api/admin/support-integration-pack.html" />;
}
