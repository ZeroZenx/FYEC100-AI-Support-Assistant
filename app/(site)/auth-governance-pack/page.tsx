import { LayerPage } from "@/components/LayerPage";
import { buildAuthAuthorizationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default function AuthGovernancePackPage() {
  const layer = buildAuthAuthorizationLayer();
  return <LayerPage eyebrow="Authentication" title="Authentication governance pack" description="IT/governance export for current pilot auth, production auth target, route policy, role rules, open risks, and sign-off needs." metrics={layer.metrics} items={layer.accessUpgrade} exportHref="/api/admin/auth-governance-pack.html" />;
}
