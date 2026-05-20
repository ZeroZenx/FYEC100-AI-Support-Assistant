import { LayerPage } from "@/components/LayerPage";
import { buildProviderGovernanceLayer } from "@/lib/institutionalLayers";

export default async function ProviderRegistryPage() {
  const layer = await buildProviderGovernanceLayer();
  return <LayerPage eyebrow="Provider Governance" title="Provider registry" description="Tracks OpenAI, DeepSeek, Ollama/local models, and future providers with hosting type, approval status, and owner." metrics={layer.metrics} items={layer.registry} exportHref="/api/admin/provider-governance-pack.html" />;
}
