import { LayerPage } from "@/components/LayerPage";
import { buildContentReleaseControlLayer } from "@/lib/finalPhaseLayers";

export default async function ReleaseRollbackSnapshotPage() {
  const layer = await buildContentReleaseControlLayer();
  return <LayerPage eyebrow="Content Release" title="Rollback snapshot" description="Rollback planning for saving the previous knowledge base version before publishing approved changes." metrics={layer.metrics} items={layer.rollback} exportHref="/api/admin/kb-release-control-pack.html" />;
}
