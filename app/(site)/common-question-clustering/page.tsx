import { LayerPage } from "@/components/LayerPage";
import { buildLecturerContentIntelligenceLayer } from "@/lib/extendedPhaseLayers";

export default async function CommonQuestionClusteringPage() {
  const layer = await buildLecturerContentIntelligenceLayer();
  return <LayerPage eyebrow="Lecturer Intelligence" title="Common question clustering" description="Groups repeated FYEC100 student questions by assignment expectations, Moodle navigation, study planning, integrity, deadlines, and concepts." metrics={layer.metrics} items={layer.clusters} exportHref="/api/admin/lecturer-intelligence-pack.html" />;
}
