import { LayerPage } from "@/components/LayerPage";
import { buildAiBenchmarkCostLayer } from "@/lib/extendedPhaseLayers";

export default async function ProviderApprovalRecommendationPage() {
  const layer = await buildAiBenchmarkCostLayer();
  return <LayerPage eyebrow="AI Benchmark" title="Provider approval recommendation" description="Recommends approve, staff-only, pilot-only, restricted, fallback-only, or reject based on evidence." metrics={layer.metrics} items={layer.approval} exportHref="/api/admin/benchmark-governance-pack.html" />;
}
