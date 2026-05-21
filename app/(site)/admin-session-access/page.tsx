import { LayerPage } from "@/components/LayerPage";
import { buildAdminSecurityLayer } from "@/lib/finalPhaseLayers";

export default async function AdminSessionAccessPage() {
  const layer = await buildAdminSecurityLayer();
  return <LayerPage eyebrow="Admin Security" title="Admin session access" description="Local signed admin session model for moving beyond shared pilot-token access during production planning." metrics={layer.metrics} items={layer.sessionAccess} exportHref="/api/admin/admin-security-pack.html" />;
}
