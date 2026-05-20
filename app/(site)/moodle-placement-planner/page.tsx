import { LayerPage } from "@/components/LayerPage";
import { buildMoodleCourseExperienceLayer } from "@/lib/institutionalLayers";

export default async function MoodlePlacementPlannerPage() {
  const layer = await buildMoodleCourseExperienceLayer();
  return <LayerPage eyebrow="Moodle Course Experience" title="Moodle placement planner" description="Decides where the assistant belongs in the FYEC100 course shell: home, orientation, assignments, weekly modules, support block, or FAQ." items={layer.placementPlanner} exportHref="/api/admin/moodle-course-experience-pack.html" />;
}
