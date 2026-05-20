import { LayerPage } from "@/components/LayerPage";
import { buildProviderGovernanceLayer } from "@/lib/institutionalLayers";

export default async function ProviderSafetyComparisonPage() {
  const layer = await buildProviderGovernanceLayer();
  return <LayerPage eyebrow="Provider Governance" title="Provider safety comparison" description="Compares provider responses on the same evaluation questions and safety regression prompts." items={layer.safetyComparison} exportHref="/api/admin/provider-governance-pack.html" />;
}
