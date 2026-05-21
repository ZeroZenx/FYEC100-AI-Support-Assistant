import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeGovernanceLayer } from "@/lib/extendedPhaseLayers";

export default async function KnowledgeGovernanceWorkflowPage() {
  const layer = await buildKnowledgeGovernanceLayer();
  return <LayerPage eyebrow="Knowledge Governance" title="Knowledge governance workflow" description="Propose, review, approve, publish, and archive workflow for AI-facing course content." metrics={layer.metrics} items={layer.workflow} exportHref="/api/admin/knowledge-governance-pack.html" />;
}
