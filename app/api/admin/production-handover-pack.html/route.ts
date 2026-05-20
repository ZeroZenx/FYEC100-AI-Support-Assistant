import { requireAdminAccess } from "@/lib/adminAuth";
import { renderProductionHandoverHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderProductionHandoverHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-production-handover-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
