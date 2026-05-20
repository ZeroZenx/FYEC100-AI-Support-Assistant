import { LayerPage } from "@/components/LayerPage";
import { buildSponsorReviewLayer } from "@/lib/institutionalLayers";

export default async function SponsorReviewPackPage() {
  const layer = await buildSponsorReviewLayer();
  return <LayerPage eyebrow="Sponsor Review" title="Sponsor review HTML pack" description="Meeting-ready export with summary, evidence, risks, decisions, blockers, next actions, and sign-off needs." metrics={layer.metrics} items={layer.sponsorDashboard} exportHref="/api/admin/sponsor-review-pack.html" />;
}
