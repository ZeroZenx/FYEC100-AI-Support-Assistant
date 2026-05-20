import { requireAdminAccess } from "@/lib/adminAuth";
import { renderDeploymentAcceptanceHtml } from "@/lib/readinessLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderDeploymentAcceptanceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-deployment-acceptance.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
