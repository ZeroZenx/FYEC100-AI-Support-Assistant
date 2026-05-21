import { LayerPage } from "@/components/LayerPage";
import { buildAuthAuthorizationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default function RouteProtectionPolicyPage() {
  const layer = buildAuthAuthorizationLayer();
  return <LayerPage eyebrow="Authentication" title="Route protection policy" description="Classifies pages as public, student-facing, Moodle-embedded, admin-only, governance-only, sponsor-only, technical-only, or pilot-only." items={layer.routePolicy} exportHref="/api/admin/auth-governance-pack.html" />;
}
