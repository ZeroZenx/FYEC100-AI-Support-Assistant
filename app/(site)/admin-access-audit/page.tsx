import { LayerPage } from "@/components/LayerPage";
import { buildAdminSecurityLayer } from "@/lib/finalPhaseLayers";

export default async function AdminAccessAuditPage() {
  const layer = await buildAdminSecurityLayer();
  return <LayerPage eyebrow="Admin Security" title="Admin access audit events" description="Audit visibility for local admin session attempts, future denied-route events, and sensitive report access." metrics={layer.metrics} items={layer.auditEvents} exportHref="/api/admin/admin-security-pack.html" />;
}
