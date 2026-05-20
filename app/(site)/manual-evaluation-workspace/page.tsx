import { LayerPage } from "@/components/LayerPage";
import { buildAiQualityLayer } from "@/lib/institutionalLayers";

export default async function ManualEvaluationWorkspacePage() {
  const layer = await buildAiQualityLayer();
  return <LayerPage eyebrow="AI Quality" title="Manual evaluation workspace" description="Lecturer and project-team review workspace for marking sample answers as pass, needs revision, unsafe, missing content, or human follow-up." items={layer.manualWorkspace} exportHref="/api/admin/ai-quality-review-pack.html" />;
}
