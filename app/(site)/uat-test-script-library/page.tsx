import { LayerPage } from "@/components/LayerPage";
import { buildUatLayer } from "@/lib/extendedPhaseLayers";

export default async function UatTestScriptLibraryPage() {
  const layer = await buildUatLayer();
  return <LayerPage eyebrow="UAT" title="UAT test script library" description="Role-based scripts for students, lecturers, LMS admins, IT, governance, project lead, and sponsor." metrics={layer.metrics} items={layer.scripts} exportHref="/api/admin/uat-evidence-pack.html" />;
}
