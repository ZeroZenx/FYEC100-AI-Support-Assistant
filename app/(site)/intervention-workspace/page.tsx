import { LayerPage } from "@/components/LayerPage";
import { buildStudentSuccessInterventionLayer } from "@/lib/finalPhaseLayers";

export default async function InterventionWorkspacePage() {
  const layer = await buildStudentSuccessInterventionLayer();
  return <LayerPage eyebrow="Student Success" title="Intervention recommendation workspace" description="Suggested human-led actions such as Moodle announcements, lecturer clarifications, short workshops, LMS guides, and KB updates." metrics={layer.metrics} items={layer.interventions} exportHref="/api/admin/student-success-pack.html" />;
}
