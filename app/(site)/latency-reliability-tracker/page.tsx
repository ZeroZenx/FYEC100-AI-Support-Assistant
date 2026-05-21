import { LayerPage } from "@/components/LayerPage";
import { buildAiBenchmarkCostLayer } from "@/lib/extendedPhaseLayers";

export default async function LatencyReliabilityTrackerPage() {
  const layer = await buildAiBenchmarkCostLayer();
  return <LayerPage eyebrow="AI Benchmark" title="Latency and reliability tracker" description="Tracks response time, provider failures, timeout events, fallback usage, and local model availability planning." metrics={layer.metrics} items={layer.reliability} exportHref="/api/admin/benchmark-governance-pack.html" />;
}
