import { LayerPage } from "@/components/LayerPage";
import { buildMultiCourseScalingLayer } from "@/lib/institutionalLayers";

export default async function CourseConfigModelPage() {
  const layer = await buildMultiCourseScalingLayer();
  return <LayerPage eyebrow="Multi-Course Scaling" title="Course configuration model" description="Defines course code, title, contact, Moodle course ID, knowledge base path, allowed topics, escalation owners, and integrity rules." metrics={layer.metrics} items={layer.courseConfig} exportHref="/api/admin/scaling-governance-pack.html" />;
}
