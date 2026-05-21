import { LayerPage } from "@/components/LayerPage";
import { buildSupportIntegrationLayer } from "@/lib/extendedPhaseLayers";

export default async function EscalationRoutingRulesPage() {
  const layer = await buildSupportIntegrationLayer();
  return <LayerPage eyebrow="Support Integration" title="Escalation routing rules" description="Maps issue type, urgency, course, Moodle role, and pilot mode to the correct support destination." metrics={layer.metrics} items={layer.routingRules} exportHref="/api/admin/support-integration-pack.html" />;
}
