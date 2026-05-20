import { LayerPage } from "@/components/LayerPage";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export default async function CaseResolutionNotesPage() {
  const layer = await buildServiceDeskLayer();
  return <LayerPage eyebrow="Production Service Desk" title="Case resolution notes" description="Guidance for recording resolution summaries, KB recommendations, Moodle fixes, technical actions, and human-led decisions." listItems={layer.resolutionNotes} exportHref="/api/admin/service-desk-pack.html" />;
}
