import { requireAdminAccess } from "@/lib/adminAuth";
import { renderRoleCommandCenterHtml } from "@/lib/finalPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderRoleCommandCenterHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
