import { LayerPage } from "@/components/LayerPage";
import { buildMultiCourseScalingLayer } from "@/lib/institutionalLayers";

export default async function PerCourseKbRoutingPage() {
  const layer = await buildMultiCourseScalingLayer();
  return <LayerPage eyebrow="Multi-Course Scaling" title="Per-course knowledge base routing" description="Loads the right knowledge base based on trusted Moodle course context or selected course." items={layer.kbRouting} exportHref="/api/admin/scaling-governance-pack.html" />;
}
