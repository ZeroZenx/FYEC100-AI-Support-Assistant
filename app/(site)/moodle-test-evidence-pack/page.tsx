import { LayerPage } from "@/components/LayerPage";
import { buildMoodleTestConnectionLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function MoodleTestEvidencePackPage() {
  const layer = await buildMoodleTestConnectionLayer();
  return <LayerPage eyebrow="Moodle Test Connection" title="Moodle test evidence pack" description="LMS/IT export showing platform config, registration checklist, launch attempts, diagnostics, trusted context, and next actions." metrics={layer.metrics} items={layer.evidence} exportHref="/api/admin/moodle-test-evidence-pack.html" />;
}
