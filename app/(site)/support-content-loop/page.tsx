import { LayerPage } from "@/components/LayerPage";
import { buildStudentSuccessInterventionLayer } from "@/lib/finalPhaseLayers";

export default async function SupportContentLoopPage() {
  const layer = await buildStudentSuccessInterventionLayer();
  return <LayerPage eyebrow="Student Success" title="Support-to-content loop" description="Connects repeated support cases and feedback to proposed knowledge base updates or human-led support decisions." metrics={layer.metrics} items={layer.supportContentLoop} exportHref="/api/admin/student-success-pack.html" />;
}
