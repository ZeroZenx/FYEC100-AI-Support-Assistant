import { LayerPage } from "@/components/LayerPage";
import { buildProductionStorageLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function RetentionPolicyEnforcementPage() {
  const layer = await buildProductionStorageLayer();
  return <LayerPage eyebrow="Production Storage" title="Retention policy enforcement plan" description="Retention windows, export-before-delete, cleanup approvals, anonymization rules, and deletion audit events." items={layer.retentionPlan} exportHref="/api/admin/storage-operations-pack.html" />;
}
