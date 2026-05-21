import { LayerPage } from "@/components/LayerPage";
import { buildAuthAuthorizationLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default function RequestContextInspectorPage() {
  const layer = buildAuthAuthorizationLayer();
  return <LayerPage eyebrow="Authentication" title="Request context inspector" description="Shows request source, trusted LTI role plan, admin token status, pilot mode, environment, and why access is allowed or blocked." metrics={layer.metrics} items={layer.requestInspector} exportHref="/api/admin/auth-governance-pack.html" />;
}
