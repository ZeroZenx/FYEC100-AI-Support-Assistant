import { requireAdminAccess } from "@/lib/adminAuth";
import { renderEnterpriseReleaseHtml } from "@/lib/extendedPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderEnterpriseReleaseHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
