import { LayerPage } from "@/components/LayerPage";
import { buildProductionStorageLayer } from "@/lib/connectionAuthStorageEvaluationLayers";

export default async function LocalFileAdapterPage() {
  const layer = await buildProductionStorageLayer();
  return <LayerPage eyebrow="Production Storage" title="Local file adapter" description="Wraps current JSONL and Markdown behavior behind a storage provider interface so local development keeps working." metrics={layer.metrics} items={layer.localAdapter} exportHref="/api/admin/storage-operations-pack.html" />;
}
