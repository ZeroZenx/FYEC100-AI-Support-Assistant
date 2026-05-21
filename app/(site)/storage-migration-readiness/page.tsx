import { LayerPage } from "@/components/LayerPage";
import { buildProductionStorageLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function StorageMigrationReadinessPage() {
  const layer = await buildProductionStorageLayer();
  return <LayerPage eyebrow="Production Storage" title="Storage migration readiness" description="Shows which records currently live in local files, what should move to production storage, and what needs approval." metrics={layer.metrics} items={layer.migrationReadiness} exportHref="/api/admin/storage-operations-pack.html" />;
}
