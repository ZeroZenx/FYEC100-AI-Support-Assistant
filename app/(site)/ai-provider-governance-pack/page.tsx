import { LayerPage } from "@/components/LayerPage";
import { buildProviderGovernanceLayer } from "@/lib/institutionalLayers";

export default async function AiProviderGovernancePackPage() {
  const layer = await buildProviderGovernanceLayer();
  return <LayerPage eyebrow="Provider Governance" title="AI provider governance HTML pack" description="IT and governance export covering provider readiness, policy approvals, risks, data considerations, and fallback decisions." metrics={layer.metrics} items={layer.registry} exportHref="/api/admin/provider-governance-pack.html" />;
}
