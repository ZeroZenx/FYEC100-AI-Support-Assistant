import { LayerPage } from "@/components/LayerPage";
import { buildMoodleTestConnectionLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function TrustedLaunchPreviewPage() {
  const layer = await buildMoodleTestConnectionLayer();
  return <LayerPage eyebrow="Moodle Test Connection" title="Trusted launch session preview" description="Preview of trusted course, role, launch source, deployment ID, and validation status after a valid Moodle LTI launch." items={layer.trustedPreview} exportHref="/api/admin/moodle-test-evidence-pack.html" />;
}
