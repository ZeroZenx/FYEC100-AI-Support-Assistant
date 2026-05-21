import { LayerPage } from "@/components/LayerPage";
import { buildMoodleTestConnectionLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function LaunchDiagnosticsPage() {
  const layer = await buildMoodleTestConnectionLayer();
  return <LayerPage eyebrow="Moodle Test Connection" title="Launch diagnostics viewer" description="Plain-language diagnostics for missing state, expired state, issuer mismatch, audience mismatch, nonce mismatch, deployment mismatch, expired token, and unsupported role." metrics={layer.metrics} items={layer.diagnostics} exportHref="/api/admin/moodle-test-evidence-pack.html" />;
}
