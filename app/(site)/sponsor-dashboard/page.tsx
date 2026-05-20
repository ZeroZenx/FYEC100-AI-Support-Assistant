import { LayerPage } from "@/components/LayerPage";
import { buildSponsorReviewLayer } from "@/lib/institutionalLayers";

export default async function SponsorDashboardPage() {
  const layer = await buildSponsorReviewLayer();
  return <LayerPage eyebrow="Sponsor Review" title="Sponsor executive dashboard" description="Leadership view of pilot status, readiness, student value signals, risks, decisions needed, and next milestone." metrics={layer.metrics} items={layer.sponsorDashboard} exportHref="/api/admin/sponsor-review-pack.html" />;
}
