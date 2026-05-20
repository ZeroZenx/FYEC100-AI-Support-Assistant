import { requireAdminAccess } from "@/lib/adminAuth";
import { renderKnowledgeBaseContentOpsHtml } from "@/lib/outcomesOperationsLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderKnowledgeBaseContentOpsHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-kb-content-ops-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
