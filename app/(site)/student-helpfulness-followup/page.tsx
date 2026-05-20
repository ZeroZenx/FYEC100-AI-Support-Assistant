import { LayerPage } from "@/components/LayerPage";
import { buildStudentExperienceLayer } from "@/lib/productionLayers";

export default async function StudentHelpfulnessFollowupPage() {
  const layer = await buildStudentExperienceLayer();
  return <LayerPage eyebrow="Student Experience" title="Student helpfulness follow-up" description="A simple optional follow-up signal asking whether the assistant helped the student know what to do next." metrics={layer.metrics} items={layer.helpfulnessFollowUp} exportHref="/api/admin/student-experience-pack.html" />;
}
