import { LayerPage } from "@/components/LayerPage";
import { buildSponsorReviewLayer } from "@/lib/institutionalLayers";

export default async function BenefitsRealizationPage() {
  const layer = await buildSponsorReviewLayer();
  return <LayerPage eyebrow="Sponsor Review" title="Benefits realization tracker" description="Expected benefits versus early pilot signals for FYEC100 student support and institutional value." metrics={layer.metrics} items={layer.benefits} exportHref="/api/admin/sponsor-review-pack.html" />;
}
