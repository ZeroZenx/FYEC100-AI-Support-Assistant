import { LayerPage } from "@/components/LayerPage";
import { buildRealLtiTechnicalLayer } from "@/lib/productionLayers";

export default async function LtiTestHarnessPage() {
  const layer = await buildRealLtiTechnicalLayer();
  return <LayerPage eyebrow="Real Moodle/LTI Build" title="LTI test harness" description="Staff-facing local test guidance for valid and invalid launches before configuring a Moodle test site." metrics={layer.metrics} items={layer.testHarness} exportHref="/api/admin/lti-technical-build.html" />;
}
