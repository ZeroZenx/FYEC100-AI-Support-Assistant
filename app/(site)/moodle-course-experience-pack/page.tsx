import { LayerPage } from "@/components/LayerPage";
import { buildMoodleCourseExperienceLayer } from "@/lib/institutionalLayers";

export default async function MoodleCourseExperiencePackPage() {
  const layer = await buildMoodleCourseExperienceLayer();
  return <LayerPage eyebrow="Moodle Course Experience" title="Moodle course experience HTML pack" description="Export for LMS admin and lecturer review before placing the assistant in the live FYEC100 course shell." items={layer.placementPlanner} exportHref="/api/admin/moodle-course-experience-pack.html" />;
}
