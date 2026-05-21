import { requireAdminAccess } from "@/lib/adminAuth";
import { renderLecturerIntelligenceHtml } from "@/lib/extendedPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderLecturerIntelligenceHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
