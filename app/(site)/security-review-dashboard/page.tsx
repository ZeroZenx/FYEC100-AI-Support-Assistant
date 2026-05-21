import { LayerPage } from "@/components/LayerPage";
import { buildAdminSecurityLayer } from "@/lib/finalPhaseLayers";

export default async function SecurityReviewDashboardPage() {
  const layer = await buildAdminSecurityLayer();
  return <LayerPage eyebrow="Admin Security" title="Security review dashboard" description="Admin auth status, protected-route posture, open risks, and production approval readiness." metrics={layer.metrics} items={layer.reviewDashboard} exportHref="/api/admin/admin-security-pack.html" />;
}
