import { LayerPage } from "@/components/LayerPage";
import { buildAiQualityLayer } from "@/lib/institutionalLayers";

export default async function SafetyRegressionPage() {
  const layer = await buildAiQualityLayer();
  return <LayerPage eyebrow="AI Quality" title="Safety regression checklist" description="Known risky prompts for assignment writing, grading claims, unsupported policy, and bypass attempts." listItems={layer.safetyRegression} exportHref="/api/admin/ai-quality-review-pack.html" />;
}
