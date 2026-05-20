import { LayerPage } from "@/components/LayerPage";
import { buildRealLtiTechnicalLayer } from "@/lib/productionLayers";

export default async function LtiStateStorePage() {
  const layer = await buildRealLtiTechnicalLayer();
  return <LayerPage eyebrow="Real Moodle/LTI Build" title="LTI launch state store" description="Stores state, nonce, timestamp, issuer, client ID, deployment ID, target link URI, and return URL for local LTI OIDC testing." metrics={layer.metrics} items={layer.stateStore} exportHref="/api/admin/lti-technical-build.html" />;
}
