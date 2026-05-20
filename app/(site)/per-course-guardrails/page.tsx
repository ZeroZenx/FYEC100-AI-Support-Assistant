import { LayerPage } from "@/components/LayerPage";
import { buildMultiCourseScalingLayer } from "@/lib/institutionalLayers";

export default async function PerCourseGuardrailsPage() {
  const layer = await buildMultiCourseScalingLayer();
  return <LayerPage eyebrow="Multi-Course Scaling" title="Per-course guardrails" description="Global academic integrity rules plus course-specific assignment boundaries and escalation guidance." items={layer.guardrails} exportHref="/api/admin/scaling-governance-pack.html" />;
}
