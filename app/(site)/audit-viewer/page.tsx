import { LayerPage } from "@/components/LayerPage";
import { buildAuditLayer } from "@/lib/auditEvents";

export default async function AuditViewerPage() {
  const layer = await buildAuditLayer();
  return <LayerPage eyebrow="Production Data and Audit" title="Audit viewer" description="Filtered staff view of admin actions, provider tests, LTI launches, validation failures, support routing, KB releases, and configuration checks." metrics={layer.metrics} items={layer.auditViewer} exportHref="/api/admin/governance-audit-pack.html" />;
}
