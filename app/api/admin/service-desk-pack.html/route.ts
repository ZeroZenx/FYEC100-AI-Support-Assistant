import { requireAdminAccess } from "@/lib/adminAuth";
import { renderServiceDeskHtml } from "@/lib/productionLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return new Response(await renderServiceDeskHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-service-desk-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
