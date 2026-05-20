import { LayerPage } from "@/components/LayerPage";
import { buildRealLtiTechnicalLayer } from "@/lib/productionLayers";

export default async function LtiLaunchFlowPage() {
  const layer = await buildRealLtiTechnicalLayer();
  return <LayerPage eyebrow="Real Moodle/LTI Build" title="OIDC login endpoint upgrade" description="Creates real state/nonce records and redirects to the Moodle authorization endpoint when platform values are configured." metrics={layer.metrics} items={layer.oidcLogin} exportHref="/api/admin/lti-technical-build.html" />;
}
