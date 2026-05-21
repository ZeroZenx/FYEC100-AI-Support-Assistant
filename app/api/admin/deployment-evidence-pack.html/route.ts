import { requireAdminAccess } from "@/lib/adminAuth";
import { renderDeploymentEvidenceHtml } from "@/lib/finalPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderDeploymentEvidenceHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
