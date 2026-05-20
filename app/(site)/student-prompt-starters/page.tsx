import { LayerPage } from "@/components/LayerPage";
import { buildStudentExperienceLayer } from "@/lib/productionLayers";

export default async function StudentPromptStartersPage() {
  const layer = await buildStudentExperienceLayer();
  return <LayerPage eyebrow="Student Experience" title="Student prompt starters" description="FYEC100-specific starter prompts for assignments, study planning, LMS navigation, reflection, integrity, and lecturer follow-up." listItems={layer.promptStarters} exportHref="/api/admin/student-experience-pack.html" />;
}
