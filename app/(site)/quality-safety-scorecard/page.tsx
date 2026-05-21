import { LayerPage } from "@/components/LayerPage";
import { buildAiBenchmarkCostLayer } from "@/lib/extendedPhaseLayers";

export default async function QualitySafetyScorecardPage() {
  const layer = await buildAiBenchmarkCostLayer();
  return <LayerPage eyebrow="AI Benchmark" title="Quality and safety scorecard" description="Compares accuracy, grounding, clarity, assignment-writing refusal, no-grading behavior, escalation quality, and tone." metrics={layer.metrics} items={layer.scorecard} exportHref="/api/admin/benchmark-governance-pack.html" />;
}
