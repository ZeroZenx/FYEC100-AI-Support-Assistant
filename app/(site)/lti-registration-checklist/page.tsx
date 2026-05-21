import { LayerPage } from "@/components/LayerPage";
import { buildMoodleTestConnectionLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function LtiRegistrationChecklistPage() {
  const layer = await buildMoodleTestConnectionLayer();
  return <LayerPage eyebrow="Moodle Test Connection" title="LTI registration checklist" description="Moodle admin checklist for external tool, launch URLs, redirect URI, JWKS URL, deployment ID, custom parameters, roles, and course placement." items={layer.registrationChecklist} exportHref="/api/admin/moodle-test-evidence-pack.html" />;
}
