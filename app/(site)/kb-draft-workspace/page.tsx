import { LayerPage } from "@/components/LayerPage";
import { buildContentReleaseControlLayer } from "@/lib/finalPhaseLayers";

export default async function KbDraftWorkspacePage() {
  const layer = await buildContentReleaseControlLayer();
  return <LayerPage eyebrow="Content Release" title="Knowledge base draft workspace" description="Staff-friendly queue for proposed FYEC100 knowledge base changes without editing Markdown directly." metrics={layer.metrics} items={layer.draftWorkspace} exportHref="/api/admin/kb-release-control-pack.html" />;
}
