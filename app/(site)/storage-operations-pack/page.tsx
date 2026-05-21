import { LayerPage } from "@/components/LayerPage";
import { buildProductionStorageLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function StorageOperationsPackPage() {
  const layer = await buildProductionStorageLayer();
  return <LayerPage eyebrow="Production Storage" title="Storage operations HTML pack" description="IT/governance export showing adapter status, data categories, retention decisions, migration risks, and implementation steps." metrics={layer.metrics} items={layer.migrationReadiness} exportHref="/api/admin/storage-operations-pack.html" />;
}
