import { LayerPage } from "@/components/LayerPage";
import { buildSponsorReviewLayer } from "@/lib/institutionalLayers";

export default async function DecisionLogPage() {
  const layer = await buildSponsorReviewLayer();
  return <LayerPage eyebrow="Sponsor Review" title="Decision log" description="Tracks major project decisions for Moodle approach, AI provider, retention, support, KB release, hosting, and authentication path." items={layer.decisions} exportHref="/api/admin/sponsor-review-pack.html" />;
}
