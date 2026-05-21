import { LayerPage } from "@/components/LayerPage";
import { buildAuthAuthorizationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default function RoleAuthorizationMatrixPage() {
  const layer = buildAuthAuthorizationLayer();
  return <LayerPage eyebrow="Authentication" title="Role authorization matrix" description="Access levels for student, lecturer, LMS admin, project lead, developer, system administrator, governance reviewer, and sponsor." metrics={layer.metrics} items={layer.roleMatrix} exportHref="/api/admin/auth-governance-pack.html" />;
}
