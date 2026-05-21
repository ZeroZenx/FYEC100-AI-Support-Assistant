import { LayerPage } from "@/components/LayerPage";
import { buildLecturerContentIntelligenceLayer } from "@/lib/extendedPhaseLayers";

export default async function TeachingInterventionPlannerPage() {
  const layer = await buildLecturerContentIntelligenceLayer();
  return <LayerPage eyebrow="Lecturer Intelligence" title="Teaching intervention planner" description="Suggested teaching actions such as reminders, Moodle announcements, orientation notes, workshops, KB updates, or human-led support." metrics={layer.metrics} items={layer.interventions} exportHref="/api/admin/lecturer-intelligence-pack.html" />;
}
