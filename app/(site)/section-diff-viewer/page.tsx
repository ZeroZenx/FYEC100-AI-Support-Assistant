import { LayerPage } from "@/components/LayerPage";
import { buildContentReleaseControlLayer } from "@/lib/finalPhaseLayers";

export default async function SectionDiffViewerPage() {
  const layer = await buildContentReleaseControlLayer();
  return <LayerPage eyebrow="Content Release" title="Section-level diff viewer" description="Human-readable section comparison for additions, removals, policy wording, assignment guidance, and LMS guidance." metrics={layer.metrics} items={layer.diffViewer} exportHref="/api/admin/kb-release-control-pack.html" />;
}
