import { LayerPage } from "@/components/LayerPage";
import { buildEvaluationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function EvaluationRunnerPage() {
  const layer = await buildEvaluationLayer();
  return <LayerPage eyebrow="Evaluation Automation" title="Evaluation runner API" description="Runs selected provider/evaluation preview against the FYEC100 dataset without using real student data." metrics={layer.metrics} listItems={layer.dataset.prompts.map((prompt) => `${prompt.id}: ${prompt.prompt}`)} exportHref="/api/admin/evaluation-evidence-pack.html" />;
}
