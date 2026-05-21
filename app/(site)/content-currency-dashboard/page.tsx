import { LayerPage } from "@/components/LayerPage";
import { buildKnowledgeGovernanceLayer } from "@/lib/extendedPhaseLayers";

export default async function ContentCurrencyDashboardPage() {
  const layer = await buildKnowledgeGovernanceLayer();
  return <LayerPage eyebrow="Knowledge Governance" title="Content currency dashboard" description="Shows stale sections, missing review dates, unapproved changes, pending requests, and courses due for KB review." metrics={layer.metrics} items={layer.currency} exportHref="/api/admin/knowledge-governance-pack.html" />;
}
