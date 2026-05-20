import { LayerPage } from "@/components/LayerPage";
import { buildMoodleCourseExperienceLayer } from "@/lib/institutionalLayers";

export default async function StudentJourneyPreviewPage() {
  const layer = await buildMoodleCourseExperienceLayer();
  return <LayerPage eyebrow="Moodle Course Experience" title="Student journey preview" description="Student path through Moodle: enter FYEC100, find materials, ask a study question, see integrity guidance, submit feedback, and get human help." items={layer.studentJourney} exportHref="/api/admin/moodle-course-experience-pack.html" />;
}
