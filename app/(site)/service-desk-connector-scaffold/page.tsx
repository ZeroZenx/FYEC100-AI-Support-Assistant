import { LayerPage } from "@/components/LayerPage";
import { buildSupportIntegrationLayer } from "@/lib/extendedPhaseLayers";

export default async function ServiceDeskConnectorScaffoldPage() {
  const layer = await buildSupportIntegrationLayer();
  return <LayerPage eyebrow="Support Integration" title="Service desk connector scaffold" description="Integration planning for email, Teams, Microsoft Forms, SharePoint list, Outlook mailbox, or future ticketing system." metrics={layer.metrics} items={layer.connectors} exportHref="/api/admin/support-integration-pack.html" />;
}
