import { LayerPage } from "@/components/LayerPage";
import { buildMultiCourseScalingLayer } from "@/lib/institutionalLayers";

export default async function ScalingGovernancePackPage() {
  const layer = await buildMultiCourseScalingLayer();
  return <LayerPage eyebrow="Multi-Course Scaling" title="Scaling governance pack" description="Approval requirements before adding new courses: content owner, KB review, support owner, Moodle placement, privacy, and evaluation." metrics={layer.metrics} items={layer.governance} exportHref="/api/admin/scaling-governance-pack.html" />;
}
