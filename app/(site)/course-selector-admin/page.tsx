import { LayerPage } from "@/components/LayerPage";
import { buildMultiCourseScalingLayer } from "@/lib/institutionalLayers";

export default async function CourseSelectorAdminPage() {
  const layer = await buildMultiCourseScalingLayer();
  return <LayerPage eyebrow="Multi-Course Scaling" title="Course selector and admin workspace" description="Lets staff plan future course pilots without changing code." metrics={layer.metrics} items={layer.selector} exportHref="/api/admin/scaling-governance-pack.html" />;
}
