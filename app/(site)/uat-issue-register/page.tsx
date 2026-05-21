import { LayerPage } from "@/components/LayerPage";
import { buildUatLayer } from "@/lib/extendedPhaseLayers";

export default async function UatIssueRegisterPage() {
  const layer = await buildUatLayer();
  return <LayerPage eyebrow="UAT" title="UAT issue register" description="Captures issue, role, severity, expected behavior, actual behavior, evidence, owner, and retest status." metrics={layer.metrics} items={layer.issueRegister} exportHref="/api/admin/uat-evidence-pack.html" />;
}
