import { LayerPage } from "@/components/LayerPage";
import { buildSponsorReviewLayer } from "@/lib/institutionalLayers";

export default async function RiskIssueHeatmapPage() {
  const layer = await buildSponsorReviewLayer();
  return <LayerPage eyebrow="Sponsor Review" title="Risk and issue heatmap" description="Leadership-facing view of technical, academic, privacy, operational, and adoption risks." items={layer.heatmap} exportHref="/api/admin/sponsor-review-pack.html" />;
}
