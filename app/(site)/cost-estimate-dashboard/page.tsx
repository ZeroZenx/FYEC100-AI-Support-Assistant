import { LayerPage } from "@/components/LayerPage";
import { buildAiBenchmarkCostLayer } from "@/lib/extendedPhaseLayers";

export default async function CostEstimateDashboardPage() {
  const layer = await buildAiBenchmarkCostLayer();
  return <LayerPage eyebrow="AI Benchmark" title="Cost estimate dashboard" description="Estimates request volume, pilot cost signals, scaled-course costs, hosted provider tradeoffs, and local hosting tradeoffs." metrics={layer.metrics} items={layer.cost} exportHref="/api/admin/benchmark-governance-pack.html" />;
}
