import { requireAdminAccess } from "@/lib/adminAuth";
import { renderKnowledgeBasePublishingHtml } from "@/lib/productionLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return new Response(await renderKnowledgeBasePublishingHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-kb-publishing-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
