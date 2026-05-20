import { LayerPage } from "@/components/LayerPage";
import { buildSponsorReviewLayer } from "@/lib/institutionalLayers";

export default async function MilestoneTimelinePage() {
  const layer = await buildSponsorReviewLayer();
  return <LayerPage eyebrow="Sponsor Review" title="Milestone timeline" description="Completed layers, active build stage, next stage, and formal sign-off points." listItems={layer.timeline} exportHref="/api/admin/sponsor-review-pack.html" />;
}
