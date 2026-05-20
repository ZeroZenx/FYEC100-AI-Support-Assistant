import { LayerPage } from "@/components/LayerPage";
import { buildAiQualityLayer } from "@/lib/institutionalLayers";

export default async function ProviderComparisonPage() {
  const layer = await buildAiQualityLayer();
  return <LayerPage eyebrow="AI Quality" title="Provider comparison harness" description="Compare OpenAI, DeepSeek, and Ollama responses against the same FYEC100 test prompts without real student data." metrics={layer.metrics} items={layer.providerComparison} exportHref="/api/admin/ai-quality-review-pack.html" />;
}
