import { LayerPage } from "@/components/LayerPage";
import { buildRoleCommandCenterLayer } from "@/lib/finalPhaseLayers";

export default async function LecturerCommandCenterPage() {
  const layer = await buildRoleCommandCenterLayer();
  return <LayerPage eyebrow="Command Center" title="Lecturer command center" description="FYEC100 content gaps, common student questions, academic integrity issues, evaluation, and intervention actions." metrics={layer.metrics} items={layer.roles.lecturer} exportHref="/api/admin/role-command-center-pack.html" />;
}
