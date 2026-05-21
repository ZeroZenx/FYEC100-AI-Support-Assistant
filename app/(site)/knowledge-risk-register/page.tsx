import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeGovernanceLayer } from "@/lib/extendedPhaseLayers";

export default async function KnowledgeRiskRegisterPage() {
  const layer = await buildKnowledgeGovernanceLayer();
  return <LayerPage eyebrow="Knowledge Governance" title="Cross-course knowledge risk register" description="Tracks unsupported claims, policy ambiguity, old deadlines, assignment risks, and content ownership gaps." metrics={layer.metrics} items={layer.riskRegister} exportHref="/api/admin/knowledge-governance-pack.html" />;
}
