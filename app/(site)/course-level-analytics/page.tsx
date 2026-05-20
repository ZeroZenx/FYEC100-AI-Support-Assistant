import { LayerPage } from "@/components/LayerPage";
import { buildMultiCourseScalingLayer } from "@/lib/institutionalLayers";

export default async function CourseLevelAnalyticsPage() {
  const layer = await buildMultiCourseScalingLayer();
  return <LayerPage eyebrow="Multi-Course Scaling" title="Course-level analytics" description="Separate feedback, launch activity, support queues, content gaps, and student experience signals by course." metrics={layer.metrics} items={layer.analytics} exportHref="/api/admin/scaling-governance-pack.html" />;
}
