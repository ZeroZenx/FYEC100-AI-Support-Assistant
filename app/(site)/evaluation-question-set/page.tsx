import { LayerPage } from "@/components/LayerPage";
import { buildAiQualityLayer } from "@/lib/institutionalLayers";

export default async function EvaluationQuestionSetPage() {
  const layer = await buildAiQualityLayer();
  return <LayerPage eyebrow="AI Quality" title="Evaluation question set" description="Curated FYEC100 prompts covering course expectations, assignments, LMS navigation, study support, responsible AI, and out-of-scope questions." metrics={layer.metrics} listItems={layer.evaluationQuestions} exportHref="/api/admin/ai-quality-review-pack.html" />;
}
