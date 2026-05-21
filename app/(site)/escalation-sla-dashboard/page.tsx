import { LayerPage } from "@/components/LayerPage";
import { buildSupportIntegrationLayer } from "@/lib/extendedPhaseLayers";

export default async function EscalationSlaDashboardPage() {
  const layer = await buildSupportIntegrationLayer();
  return <LayerPage eyebrow="Support Integration" title="Escalation SLA and ownership dashboard" description="Shows who owns escalations, response expectations, unresolved items, and overdue risk." metrics={layer.metrics} items={layer.sla} exportHref="/api/admin/support-integration-pack.html" />;
}
