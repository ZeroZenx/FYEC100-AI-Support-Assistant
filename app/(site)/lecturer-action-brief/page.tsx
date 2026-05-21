import { LayerPage } from "@/components/LayerPage";
import { buildStudentSuccessInterventionLayer } from "@/lib/finalPhaseLayers";

export default async function LecturerActionBriefPage() {
  const layer = await buildStudentSuccessInterventionLayer();
  return <LayerPage eyebrow="Student Success" title="Lecturer action brief" description="Focused FYEC100 lecturer view of common questions, confusing topics, announcement ideas, content gaps, and student support themes." metrics={layer.metrics} items={layer.actionBrief} exportHref="/api/admin/student-success-pack.html" />;
}
