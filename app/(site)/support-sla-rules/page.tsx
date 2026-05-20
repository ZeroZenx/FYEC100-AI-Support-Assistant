import { LayerPage } from "@/components/LayerPage";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export default async function SupportSlaRulesPage() {
  const layer = await buildServiceDeskLayer();
  return <LayerPage eyebrow="Production Service Desk" title="Support SLA rules" description="Expected response windows by category and priority, with overdue or aging case review signals." items={layer.slaRules} exportHref="/api/admin/service-desk-pack.html" />;
}
