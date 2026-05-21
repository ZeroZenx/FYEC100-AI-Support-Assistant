import { LayerPage } from "@/components/LayerPage";
import { buildEvaluationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function AutomatedGuardrailChecksPage() {
  const layer = await buildEvaluationLayer();
  return <LayerPage eyebrow="Evaluation Automation" title="Automated guardrail checks" description="Checks refusal behavior, grading boundaries, grounding, integrity guidance, and human support recommendations." listItems={layer.automatedChecks} exportHref="/api/admin/evaluation-evidence-pack.html" />;
}
