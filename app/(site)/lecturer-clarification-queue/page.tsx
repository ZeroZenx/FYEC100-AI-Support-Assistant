import { LayerPage } from "@/components/LayerPage";
import { buildLecturerContentIntelligenceLayer } from "@/lib/extendedPhaseLayers";

export default async function LecturerClarificationQueuePage() {
  const layer = await buildLecturerContentIntelligenceLayer();
  return <LayerPage eyebrow="Lecturer Intelligence" title="Lecturer clarification queue" description="Items likely needing lecturer input, suggested clarification wording, and Moodle announcement candidates." metrics={layer.metrics} items={layer.clarificationQueue} exportHref="/api/admin/lecturer-intelligence-pack.html" />;
}
