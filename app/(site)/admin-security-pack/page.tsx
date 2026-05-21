import { LayerPage } from "@/components/LayerPage";
import { buildAdminSecurityLayer } from "@/lib/finalPhaseLayers";

export default async function AdminSecurityPackPage() {
  const layer = await buildAdminSecurityLayer();
  return <LayerPage eyebrow="Admin Security" title="Admin security HTML pack" description="Exportable admin security evidence for COSTAATT IT and governance review." metrics={layer.metrics} items={layer.reviewDashboard} exportHref="/api/admin/admin-security-pack.html" />;
}
