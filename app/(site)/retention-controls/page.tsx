import { LayerPage } from "@/components/LayerPage";
import { buildAuditLayer } from "@/lib/auditEvents";

export default async function RetentionControlsPage() {
  const layer = await buildAuditLayer();
  return <LayerPage eyebrow="Production Data and Audit" title="Data retention controls" description="Export, cleanup preview, deletion procedure, retention status, and clear visibility into what would be removed before deletion." items={layer.retentionControls} exportHref="/api/admin/governance-audit-pack.html" />;
}
