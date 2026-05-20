import { LayerPage } from "@/components/LayerPage";
import { buildStudentExperienceLayer } from "@/lib/productionLayers";

export default async function InterventionRecommendationsPage() {
  const layer = await buildStudentExperienceLayer();
  return <LayerPage eyebrow="Student Experience" title="Intervention recommendations" description="Non-automated support actions such as Moodle announcements, lecturer clarification, workshops, KB updates, and LMS guidance." items={layer.interventionRecommendations} exportHref="/api/admin/student-experience-pack.html" />;
}
