import { requireAdminAccess } from "@/lib/adminAuth";
import { renderGovernancePackHtml } from "@/lib/readinessLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderGovernancePackHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-governance-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
