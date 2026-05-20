import { LayerPage } from "@/components/LayerPage";
import { buildProviderGovernanceLayer } from "@/lib/institutionalLayers";

export default async function ProviderPolicyMatrixPage() {
  const layer = await buildProviderGovernanceLayer();
  return <LayerPage eyebrow="Provider Governance" title="Provider policy matrix" description="Defines which providers are allowed for local testing, Moodle pilot, production student use, staff-only use, or restricted use." items={layer.policy} exportHref="/api/admin/provider-governance-pack.html" />;
}
