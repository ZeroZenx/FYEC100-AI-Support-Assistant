import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeGovernanceLayer } from "@/lib/extendedPhaseLayers";

export default async function KnowledgeGovernancePackPage() {
  const layer = await buildKnowledgeGovernanceLayer();
  return <LayerPage eyebrow="Knowledge Governance" title="Knowledge governance HTML pack" description="Exportable academic governance pack showing ownership, source policy, review status, risks, and next actions." metrics={layer.metrics} items={layer.ownership} exportHref="/api/admin/knowledge-governance-pack.html" />;
}
