import { LayerPage } from "@/components/LayerPage";
import { buildRealLtiTechnicalLayer } from "@/lib/productionLayers";

export default async function LtiValidationPage() {
  const layer = await buildRealLtiTechnicalLayer();
  return <LayerPage eyebrow="Real Moodle/LTI Build" title="LTI launch validation endpoint" description="Validates the local launch state, ID token claims, issuer, audience, deployment ID, nonce, message type, target link, and expiration." metrics={layer.metrics} listItems={layer.validation} exportHref="/api/admin/lti-technical-build.html" />;
}
