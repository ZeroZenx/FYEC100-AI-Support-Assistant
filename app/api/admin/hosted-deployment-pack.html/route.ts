import { requireAdminAccess } from "@/lib/adminAuth";
import { renderHostedDeploymentPackHtml } from "@/lib/hostedDeploymentPack";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderHostedDeploymentPackHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-hosted-deployment-readiness.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
