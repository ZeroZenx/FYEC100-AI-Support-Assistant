import { LayerPage } from "@/components/LayerPage";
import { buildStudentSuccessInterventionLayer } from "@/lib/finalPhaseLayers";

export default async function StudentNeedsDashboardPage() {
  const layer = await buildStudentSuccessInterventionLayer();
  return <LayerPage eyebrow="Student Success" title="Student needs dashboard" description="Recurring FYEC100 support needs such as assignments, study planning, LMS navigation, integrity, and lecturer clarification." metrics={layer.metrics} items={layer.needs} exportHref="/api/admin/student-success-pack.html" />;
}
