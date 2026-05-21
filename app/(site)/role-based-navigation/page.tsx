import { LayerPage } from "@/components/LayerPage";
import { buildAuthAuthorizationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default function RoleBasedNavigationPage() {
  const layer = buildAuthAuthorizationLayer();
  return <LayerPage eyebrow="Authentication" title="Role-based navigation" description="Simplifies the report/admin universe so each role sees the right workspaces." items={layer.navigation} exportHref="/api/admin/auth-governance-pack.html" />;
}
