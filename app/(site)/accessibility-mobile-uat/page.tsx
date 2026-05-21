import { LayerPage } from "@/components/LayerPage";
import { buildUatLayer } from "@/lib/extendedPhaseLayers";

export default async function AccessibilityMobileUatPage() {
  const layer = await buildUatLayer();
  return <LayerPage eyebrow="UAT" title="Accessibility and mobile UAT checklist" description="Keyboard navigation, iframe mobile view, readable text, contrast, screen-reader basics, and human support visibility." metrics={layer.metrics} items={layer.accessibilityMobile} exportHref="/api/admin/uat-evidence-pack.html" />;
}
