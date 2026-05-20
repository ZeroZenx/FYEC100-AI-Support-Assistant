import { LayerPage } from "@/components/LayerPage";
import { buildStudentExperienceLayer } from "@/lib/productionLayers";

export default async function StudentExperienceReportPage() {
  const layer = await buildStudentExperienceLayer();
  return <LayerPage eyebrow="Student Experience" title="Student experience report" description="Sponsor-facing report showing student-facing value without claiming automated grading, assessment, or proven learning outcomes." metrics={layer.metrics} items={layer.interventionRecommendations} exportHref="/api/admin/student-experience-pack.html" />;
}
