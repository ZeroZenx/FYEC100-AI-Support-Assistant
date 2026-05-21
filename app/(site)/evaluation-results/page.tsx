import { LayerPage } from "@/components/LayerPage";
import { buildEvaluationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function EvaluationResultsPage() {
  const layer = await buildEvaluationLayer();
  return <LayerPage eyebrow="Evaluation Automation" title="Evaluation results dashboard" description="Pass rate, failures by category, risky prompts, provider comparison signals, and recommended remediation." metrics={layer.metrics} listItems={layer.recommendations} exportHref="/api/admin/evaluation-evidence-pack.html" />;
}
