import { LayerPage } from "@/components/LayerPage";
import { buildEvaluationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function EvaluationEvidencePackPage() {
  const layer = await buildEvaluationLayer();
  return <LayerPage eyebrow="Evaluation Automation" title="Evaluation evidence HTML pack" description="Academic/governance export showing test coverage, results, failures, risks, and next actions." metrics={layer.metrics} listItems={layer.recommendations} exportHref="/api/admin/evaluation-evidence-pack.html" />;
}
