import { LayerPage } from "@/components/LayerPage";
import { buildUatLayer } from "@/lib/extendedPhaseLayers";

export default async function UatEvidencePackPage() {
  const layer = await buildUatLayer();
  return <LayerPage eyebrow="UAT" title="UAT evidence HTML pack" description="Exportable go/no-go review pack with pass/fail status, unresolved issues, owner assignments, risks, and sign-off." metrics={layer.metrics} items={layer.launchGate} exportHref="/api/admin/uat-evidence-pack.html" />;
}
