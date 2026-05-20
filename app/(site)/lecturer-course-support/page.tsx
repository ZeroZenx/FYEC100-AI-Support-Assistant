import { LayerPage } from "@/components/LayerPage";
import { buildMoodleCourseExperienceLayer } from "@/lib/institutionalLayers";

export default async function LecturerCourseSupportPage() {
  const layer = await buildMoodleCourseExperienceLayer();
  return <LayerPage eyebrow="Moodle Course Experience" title="Lecturer course support view" description="Lecturer-facing view of common FYEC100 questions, content gaps, responsible AI issues, and recommended announcements." items={layer.lecturerView} exportHref="/api/admin/moodle-course-experience-pack.html" />;
}
