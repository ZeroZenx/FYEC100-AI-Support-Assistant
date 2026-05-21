import { LayerPage } from "@/components/LayerPage";
import { buildLecturerContentIntelligenceLayer } from "@/lib/extendedPhaseLayers";

export default async function LecturerIntelligencePackPage() {
  const layer = await buildLecturerContentIntelligenceLayer();
  return <LayerPage eyebrow="Lecturer Intelligence" title="Lecturer intelligence HTML pack" description="Exportable lecturer/project review pack with themes, interventions, unresolved gaps, and recommended actions." metrics={layer.metrics} items={layer.clarificationQueue} exportHref="/api/admin/lecturer-intelligence-pack.html" />;
}
