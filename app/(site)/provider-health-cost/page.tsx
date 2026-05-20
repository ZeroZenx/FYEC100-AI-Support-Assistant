import { LayerPage } from "@/components/LayerPage";
import { buildProviderGovernanceLayer } from "@/lib/institutionalLayers";

export default async function ProviderHealthCostPage() {
  const layer = await buildProviderGovernanceLayer();
  return <LayerPage eyebrow="Provider Governance" title="Provider health and cost signals" description="Basic provider status, latency, failure count, configured model, local or hosted indicator, and future cost tracking fields." metrics={layer.metrics} items={layer.healthCost} exportHref="/api/admin/provider-governance-pack.html" />;
}
