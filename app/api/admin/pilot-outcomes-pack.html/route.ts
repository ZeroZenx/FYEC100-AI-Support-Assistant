import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotOutcomesPackHtml } from "@/lib/outcomesOperationsLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderPilotOutcomesPackHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-outcomes-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
