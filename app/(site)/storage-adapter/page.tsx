import { LayerPage } from "@/components/LayerPage";
import { buildAuditLayer } from "@/lib/auditEvents";

export default async function StorageAdapterPage() {
  const layer = await buildAuditLayer();
  return <LayerPage eyebrow="Production Data and Audit" title="Production storage adapter" description="Keeps local file storage for development while defining a clean adapter path for PostgreSQL, SQL Server, SharePoint, or another approved store." items={layer.storageAdapter} exportHref="/api/admin/governance-audit-pack.html" />;
}
