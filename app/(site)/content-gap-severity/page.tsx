import { LayerPage } from "@/components/LayerPage";
import { buildLecturerContentIntelligenceLayer } from "@/lib/extendedPhaseLayers";

export default async function ContentGapSeverityPage() {
  const layer = await buildLecturerContentIntelligenceLayer();
  return <LayerPage eyebrow="Lecturer Intelligence" title="Content gap severity scoring" description="Ranks unresolved FYEC100 content gaps by risk, priority, academic importance, and student confusion." metrics={layer.metrics} items={layer.severity} exportHref="/api/admin/lecturer-intelligence-pack.html" />;
}
