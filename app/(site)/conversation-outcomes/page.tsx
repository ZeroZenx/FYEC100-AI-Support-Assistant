import { LayerPage } from "@/components/LayerPage";
import { buildStudentExperienceLayer } from "@/lib/productionLayers";

export default async function ConversationOutcomesPage() {
  const layer = await buildStudentExperienceLayer();
  return <LayerPage eyebrow="Student Experience" title="Conversation outcome tags" description="Outcome tags for answered, needs lecturer, needs LMS support, content gap, integrity boundary, and technical issue conversations." listItems={layer.outcomeTags} exportHref="/api/admin/student-experience-pack.html" />;
}
