import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeGovernanceLayer } from "@/lib/extendedPhaseLayers";

export default async function ApprovedSourcePolicyPage() {
  const layer = await buildKnowledgeGovernanceLayer();
  return <LayerPage eyebrow="Knowledge Governance" title="Approved source policy" description="Defines which sources the assistant may use and which informal or unsupported sources remain restricted." metrics={layer.metrics} items={layer.policy} exportHref="/api/admin/knowledge-governance-pack.html" />;
}
