import { LayerPage } from "@/components/LayerPage";
import { buildStudentExperienceLayer } from "@/lib/productionLayers";

export default async function LearningSupportThemesPage() {
  const layer = await buildStudentExperienceLayer();
  return <LayerPage eyebrow="Student Experience" title="Learning support themes" description="Dashboard view of recurring student needs: deadlines, assignment expectations, LMS navigation, study habits, and responsible AI use." metrics={layer.metrics} items={layer.themes} exportHref="/api/admin/student-experience-pack.html" />;
}
