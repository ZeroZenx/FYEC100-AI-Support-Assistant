import { LayerPage } from "@/components/LayerPage";
import { buildMoodleTestConnectionLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function MoodlePlatformConfigPage() {
  const layer = await buildMoodleTestConnectionLayer();
  return <LayerPage eyebrow="Moodle Test Connection" title="Moodle platform config workspace" description="Required Moodle issuer, client ID, deployment ID, auth URL, token URL, JWKS URL, redirect URI, tool URL, and missing values." metrics={layer.metrics} items={layer.platformConfig} exportHref="/api/admin/moodle-test-evidence-pack.html" />;
}
