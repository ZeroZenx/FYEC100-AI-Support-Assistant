import { LayerPage } from "@/components/LayerPage";
import { buildContentReleaseControlLayer } from "@/lib/finalPhaseLayers";

export default async function PublishPreviewPage() {
  const layer = await buildContentReleaseControlLayer();
  return <LayerPage eyebrow="Content Release" title="Publish preview" description="Preview of what the assistant will use before the live FYEC100 knowledge base is replaced." metrics={layer.metrics} items={layer.preview} exportHref="/api/admin/kb-release-control-pack.html" />;
}
