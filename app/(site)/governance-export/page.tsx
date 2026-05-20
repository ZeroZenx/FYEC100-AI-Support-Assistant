import { LayerPage } from "@/components/LayerPage";
import { buildAuditLayer } from "@/lib/auditEvents";

export default async function GovernanceExportPage() {
  const layer = await buildAuditLayer();
  return <LayerPage eyebrow="Production Data and Audit" title="Governance export pack" description="Human-readable audit, retention, storage, support, KB release, and pilot decision export notes for institutional review." listItems={layer.governanceExport} exportHref="/api/admin/governance-audit-pack.html" />;
}
