import { LayerPage } from "@/components/LayerPage";
import { buildRealLtiTechnicalLayer } from "@/lib/productionLayers";

export default async function TrustedMoodleContextPage() {
  const layer = await buildRealLtiTechnicalLayer();
  return <LayerPage eyebrow="Real Moodle/LTI Build" title="Trusted Moodle context mapping" description="Maps validated Moodle LTI claims into trusted course ID, course short name, launch source, and role context for the assistant." items={layer.trustedContext} exportHref="/api/admin/lti-technical-build.html" />;
}
