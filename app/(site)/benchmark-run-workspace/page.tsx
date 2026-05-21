import { LayerPage } from "@/components/LayerPage";
import { buildAiBenchmarkCostLayer } from "@/lib/extendedPhaseLayers";

export default async function BenchmarkRunWorkspacePage() {
  const layer = await buildAiBenchmarkCostLayer();
  return <LayerPage eyebrow="AI Benchmark" title="Benchmark run workspace" description="Run approved FYEC100 prompts across OpenAI, DeepSeek, Ollama/local, and future providers without real student data." metrics={layer.metrics} items={layer.runs} exportHref="/api/admin/benchmark-governance-pack.html" />;
}
