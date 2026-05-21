import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotCloseoutScaleHtml } from "@/lib/finalPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderPilotCloseoutScaleHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
