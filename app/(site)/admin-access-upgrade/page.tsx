import { LayerPage } from "@/components/LayerPage";
import { buildAuthAuthorizationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default function AdminAccessUpgradePage() {
  const layer = buildAuthAuthorizationLayer();
  return <LayerPage eyebrow="Authentication" title="Admin access upgrade plan" description="Path beyond ADMIN_ACCESS_TOKEN toward trusted Moodle/LTI roles, institutional SSO, or approved reverse-proxy authentication." items={layer.accessUpgrade} exportHref="/api/admin/auth-governance-pack.html" />;
}
