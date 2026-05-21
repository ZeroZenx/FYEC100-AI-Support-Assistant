import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeGovernanceLayer } from "@/lib/extendedPhaseLayers";

export default async function KnowledgeOwnershipRegistryPage() {
  const layer = await buildKnowledgeGovernanceLayer();
  return <LayerPage eyebrow="Knowledge Governance" title="Knowledge ownership registry" description="Tracks content owner, reviewer, approver, review cadence, and source authority for AI-facing course knowledge." metrics={layer.metrics} items={layer.ownership} exportHref="/api/admin/knowledge-governance-pack.html" />;
}
