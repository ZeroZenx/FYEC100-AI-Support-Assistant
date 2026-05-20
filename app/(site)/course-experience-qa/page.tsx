import { LayerPage } from "@/components/LayerPage";
import { buildMoodleCourseExperienceLayer } from "@/lib/institutionalLayers";

export default async function CourseExperienceQaPage() {
  const layer = await buildMoodleCourseExperienceLayer();
  return <LayerPage eyebrow="Moodle Course Experience" title="Course experience QA checklist" description="Checks whether the assistant feels natural inside Moodle across iframe sizing, mobile, navigation, language, and human support visibility." items={layer.qaChecklist} exportHref="/api/admin/moodle-course-experience-pack.html" />;
}
