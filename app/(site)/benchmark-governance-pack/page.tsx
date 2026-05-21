import { LayerPage } from "@/components/LayerPage";
import { buildAiBenchmarkCostLayer } from "@/lib/extendedPhaseLayers";

export default async function BenchmarkGovernancePackPage() {
  const layer = await buildAiBenchmarkCostLayer();
  return <LayerPage eyebrow="AI Benchmark" title="Benchmark governance HTML pack" description="Exportable provider comparison, cost signals, safety risks, and approval recommendation pack." metrics={layer.metrics} items={layer.scorecard} exportHref="/api/admin/benchmark-governance-pack.html" />;
}
