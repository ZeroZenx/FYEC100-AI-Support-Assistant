import { LayerPage } from "@/components/LayerPage";
import { buildStudentSuccessInterventionLayer } from "@/lib/finalPhaseLayers";

export default async function StudentSuccessPackPage() {
  const layer = await buildStudentSuccessInterventionLayer();
  return <LayerPage eyebrow="Student Success" title="Student success HTML pack" description="Exportable academic support evidence showing needs, interventions, lecturer actions, and support-to-content recommendations." metrics={layer.metrics} items={layer.needs} exportHref="/api/admin/student-success-pack.html" />;
}
