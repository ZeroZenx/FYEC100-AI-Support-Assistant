import { LayerPage } from "@/components/LayerPage";
import { buildProductionStorageLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function StorageProviderInterfacePage() {
  const layer = await buildProductionStorageLayer();
  return <LayerPage eyebrow="Production Storage" title="Storage provider interface" description="TypeScript provider contract for feedback, audit events, launch states, service desk cases, KB releases, evaluations, and configuration records." metrics={layer.metrics} listItems={layer.contract} exportHref="/api/admin/storage-operations-pack.html" />;
}
