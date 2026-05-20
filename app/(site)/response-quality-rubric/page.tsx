import { LayerPage } from "@/components/LayerPage";
import { buildAiQualityLayer } from "@/lib/institutionalLayers";

export default async function ResponseQualityRubricPage() {
  const layer = await buildAiQualityLayer();
  return <LayerPage eyebrow="AI Quality" title="Response quality rubric" description="Staff-friendly rubric for accuracy, grounding, clarity, refusal behavior, integrity guidance, and escalation." items={layer.rubric} exportHref="/api/admin/ai-quality-review-pack.html" />;
}
