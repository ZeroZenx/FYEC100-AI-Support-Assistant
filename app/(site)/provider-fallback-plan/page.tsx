import { LayerPage } from "@/components/LayerPage";
import { buildProviderGovernanceLayer } from "@/lib/institutionalLayers";

export default async function ProviderFallbackPlanPage() {
  const layer = await buildProviderGovernanceLayer();
  return <LayerPage eyebrow="Provider Governance" title="Provider fallback plan" description="Defines fallback provider, local-only mode, knowledge-base-only fallback, or stop-pilot triggers when the preferred provider fails." items={layer.fallback} exportHref="/api/admin/provider-governance-pack.html" />;
}
