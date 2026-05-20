import { LayerPage } from "@/components/LayerPage";
import { buildAiQualityLayer } from "@/lib/institutionalLayers";

export default async function AiQualityReviewPackPage() {
  const layer = await buildAiQualityLayer();
  return <LayerPage eyebrow="AI Quality" title="AI quality review HTML pack" description="Governance and academic review export with results, risks, failed prompts, content gaps, and improvement actions." metrics={layer.metrics} items={layer.rubric} exportHref="/api/admin/ai-quality-review-pack.html" />;
}
